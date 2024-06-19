import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Location } from '@prisma/client';
import { ERROR_MESSAGES } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { AssetPageOptions } from './dto';

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
}
