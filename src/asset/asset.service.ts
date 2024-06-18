import { BadRequestException, Injectable } from '@nestjs/common';
import { Location } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetPageOptions } from './dto';

@Injectable()
export class AssetService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAssets(location: Location, dto: AssetPageOptions) {
    const categoryIds = dto.categoryIds || [];

    const categories = await this.prismaService.category.findMany({
      where: {
        id: {
          in: categoryIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (categories.length !== categoryIds.length) {
      throw new BadRequestException('Some categories do not exist');
    }

    const conditions = {
      where: {
        location: location,
        ...(dto.search &&
          dto.search.length > 0 && {
            OR: [
              {
                name: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                assetCode: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }),
        ...(dto.states &&
          dto.states.length > 0 && {
            state: {
              in: dto.states,
            },
          }),
        ...(dto.categoryIds &&
          dto.categoryIds.length > 0 && {
            categoryId: {
              in: dto.categoryIds,
            },
          }),
      },
      orderBy: [
        {
          assetCode: dto.assetCodeOrder,
        },
        {
          name: dto.nameOrder,
        },
        {
          category: {
            name: dto.categoryOrder,
          },
        },
        {
          state: dto.stateOrder,
        },
      ],
    };

    const pageOptions = {
      take: dto.take,
      skip: dto.skip,
    };

    const [assets, totalCount] = await Promise.all([
      this.prismaService.asset.findMany({
        ...conditions,
        ...pageOptions,
        select: {
          id: true,
          assetCode: true,
          name: true,
          state: true,
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prismaService.asset.count({
        ...conditions,
      }),
    ]);

    return {
      data: assets,
      pagination: {
        totalPages: Math.ceil(totalCount / dto.take),
        totalCount,
      },
    };
  }
}
