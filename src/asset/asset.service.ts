import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountType, AssetState, Location } from '@prisma/client';
import { ERROR_MESSAGES, Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetPageOptions, UpdateAssetDto } from './dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UserType } from 'src/users/types';

@Injectable()
export class AssetService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAssets(location: Location, dto: AssetPageOptions) {
    if (!Object.values(Location).includes(location)) {
      throw new BadRequestException(ERROR_MESSAGES.ASSET_INVALID_LOCATION);
    }

    if (dto.categoryIds && dto.categoryIds.length > 0) {
      const categories = await this.prismaService.category.findMany({
        where: {
          id: {
            in: dto.categoryIds,
          },
        },
        select: {
          id: true,
        },
      });

      if (categories.length !== dto.categoryIds.length) {
        throw new BadRequestException(ERROR_MESSAGES.ASSET_CATEGORY_NOT_FOUND);
      }
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
      orderBy: {
        [dto.sortField]:
          dto.sortField === 'category'
            ? { name: dto.sortOrder }
            : dto.sortOrder,
      },
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

  async getAsset(location: Location, id: number) {
    if (!Object.values(Location).includes(location)) {
      throw new BadRequestException(ERROR_MESSAGES.ASSET_INVALID_LOCATION);
    }

    const asset = await this.prismaService.asset.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        assetCode: true,
        name: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        installedDate: true,
        state: true,
        location: true,
        specification: true,
        assignments: {
          select: {
            id: true,
            assignedDate: true,
            assignedTo: {
              select: {
                id: true,
                username: true,
              },
            },
            assignedBy: {
              select: {
                id: true,
                username: true,
              },
            },
            returningRequest: {
              select: {
                id: true,
                returnedDate: true,
              },
            },
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(ERROR_MESSAGES.ASSET_NOT_FOUND);
    }

    if (asset.location !== location) {
      throw new ForbiddenException(ERROR_MESSAGES.ASSET_ACCESS_DENIED);
    }

    return asset;
  }
  async create(location: Location, createAssetDto: CreateAssetDto) {
    try {
      if (!Object.values(Location).includes(location)) {
        throw new BadRequestException(Messages.ASSET.FAILED.INVALID_LOCATION);
      }
      const category = await this.prismaService.category.findUnique({
        where: { id: createAssetDto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(Messages.ASSET.FAILED.CATEGORY_NOT_FOUND);
      }

      const lastAsset = await this.prismaService.asset.findFirst({
        where: { categoryId: createAssetDto.categoryId },
        orderBy: { assetCode: 'desc' },
      });

      const lastAssetCodeNumber = lastAsset
        ? parseInt(lastAsset.assetCode.slice(category.prefix.length))
        : 0;

      const newAssetCode = `${category.prefix}${(lastAssetCodeNumber + 1).toString().padStart(6, '0')}`;

      const newAsset = await this.prismaService.asset.create({
        data: {
          assetCode: newAssetCode,
          name: createAssetDto.name,
          specification: createAssetDto.specification,
          installedDate: new Date(createAssetDto.installedDate),
          state: createAssetDto.state,
          location: location,
          categoryId: createAssetDto.categoryId,
        },
        select: {
          assetCode: true,
          name: true,
          specification: true,
          state: true,
          category: {
            select: {
              name: true,
              prefix: true,
            },
          },
        },
      });
      return newAsset;
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
          error: error.response.error,
          statusCode: error.response.statusCode,
        },
        error.getStatus(),
        error.getResponse(),
      );
    }
  }

  async update(admin: UserType, id: number, dto: UpdateAssetDto) {
    try {
      const { installedDate } = dto;
      if (installedDate) {
        dto.installedDate = new Date(installedDate);
      }
      const asset = await this.prismaService.asset.findUnique({
        where: {
          id,
        },
      });
      if (!asset) {
        throw new NotFoundException(Messages.ASSET.FAILED.NOT_FOUND);
      }
      if (
        admin.location !== asset.location &&
        admin.type === AccountType.ADMIN
      ) {
        throw new ForbiddenException(
          Messages.ASSET.FAILED.UPDATE_NOT_SAME_LOCATION,
        );
      }
      if (asset.state === AssetState.ASSIGNED) {
        throw new BadRequestException(Messages.ASSET.FAILED.ASSET_IS_ASSIGNED);
      }

      if (dto.state) {
        if (
          !Object.values(AssetState).includes(dto.state) ||
          dto.state === AssetState.ASSIGNED
        ) {
          throw new BadRequestException(
            Messages.ASSET.FAILED.ASSET_STATE_INVALID,
          );
        }
      }
      return await this.prismaService.asset.update({
        where: {
          id,
        },
        data: {
          ...dto,
        },
      });
    } catch (error) {
      throw new HttpException(
        {
          message: error.message,
          error: error.response.error,
          statusCode: error.response.statusCode,
        },
        error.getStatus(),
        error.getResponse(),
      );
    }
  }
}
