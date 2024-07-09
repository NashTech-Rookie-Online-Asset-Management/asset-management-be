import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Messages } from 'src/common/constants';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createCategoryDto: CreateCategoryDto) {
    const { name, prefix } = createCategoryDto;
    try {
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          OR: [
            {
              name: { equals: name, mode: 'insensitive' },
            },
            {
              prefix: {
                equals: prefix,
                mode: 'insensitive',
              },
            },
          ],
        },
      });

      if (existingCategory) {
        if (
          existingCategory.name?.toLocaleLowerCase() ===
          name?.toLocaleLowerCase()
        ) {
          throw new BadRequestException(Messages.CATEGORY.FAILED.NAME_EXIST);
        }
        if (existingCategory.prefix.toUpperCase() === prefix.toUpperCase()) {
          throw new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST);
        }
      }
      const category = await this.prismaService.category.create({
        data: createCategoryDto,
      });
      return category;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return this.prismaService.category.findMany();
  }

  async findOne(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id: id },
    });
    if (!category) {
      throw new BadRequestException(Messages.CATEGORY.FAILED.NOT_FOUND);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { name, prefix } = updateCategoryDto;
    const category = await this.prismaService.category.findUnique({
      where: { id: id },
      include: { assets: true },
    });

    if (!category) {
      throw new BadRequestException(Messages.CATEGORY.FAILED.NOT_FOUND);
    }

    if (category?.assets?.length > 0) {
      throw new BadRequestException(
        Messages.CATEGORY.FAILED.CATEGORY_CAN_NOT_BE_CHANGED,
      );
    }

    if (name || prefix) {
      const existingCategory = await this.prismaService.category.findFirst({
        where: {
          OR: [{ name: name }, { prefix: prefix }],
          NOT: { id: id },
        },
      });

      if (existingCategory) {
        if (existingCategory.name === name) {
          throw new BadRequestException(Messages.CATEGORY.FAILED.NAME_EXIST);
        }
        if (existingCategory.prefix === prefix) {
          throw new BadRequestException(Messages.CATEGORY.FAILED.PREFIX_EXIST);
        }
      }
    }
    return this.prismaService.category.update({
      where: { id: id },
      data: updateCategoryDto,
    });
  }
  async remove(id: number) {
    const category = await this.prismaService.category.findFirst({
      where: { id: id },
      include: { assets: true },
    });
    if (!category) {
      throw new BadRequestException(Messages.CATEGORY.FAILED.NOT_FOUND);
    }
    if (category?.assets?.length > 0) {
      throw new BadRequestException(
        Messages.CATEGORY.FAILED.CATEGORY_CAN_NOT_BE_DELETED,
      );
    }

    return this.prismaService.category.delete({
      where: { id: id },
    });
  }
}
