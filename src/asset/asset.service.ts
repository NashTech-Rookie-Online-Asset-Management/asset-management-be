import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountType, AssetState, Location } from '@prisma/client';
import { Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import { AssetPageOptions, UpdateAssetDto } from './dto';
import { CreateAssetDto } from './dto/create-asset.dto';
import { LockService } from 'src/lock/lock.service';

@Injectable()
export class AssetService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly lockService: LockService,
  ) {}

  async getAssets(location: Location, dto: AssetPageOptions) {
    if (!Object.values(Location).includes(location)) {
      throw new BadRequestException(Messages.ASSET.FAILED.INVALID_LOCATION);
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
        throw new BadRequestException(Messages.ASSET.FAILED.CATEGORY_NOT_FOUND);
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
          assignments: {
            select: {
              id: true,
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
      throw new BadRequestException(Messages.ASSET.FAILED.INVALID_LOCATION);
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
        updatedAt: true,
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
      throw new NotFoundException(Messages.ASSET.FAILED.NOT_FOUND);
    }

    if (asset.location !== location) {
      throw new ForbiddenException(Messages.ASSET.FAILED.ACCESS_DENIED);
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
          id: true,
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
    const lockAcquired = await this.lockService.acquireLock(`asset-${id}`, 5);
    if (!lockAcquired) {
      throw new ConflictException(Messages.ASSET.FAILED.CONCURRENT_UPDATE);
    }
    try {
      const { installedDate, updatedAt } = dto;
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

      if (updatedAt) {
        const newDate = new Date(updatedAt);
        if (asset.updatedAt.getTime() !== newDate.getTime()) {
          throw new ConflictException(Messages.ASSET.FAILED.DATA_EDITED);
        }
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
      const updatedAsset = await this.prismaService.asset.update({
        where: {
          id,
        },
        data: {
          ...dto,
          updatedAt: undefined,
        },
        select: {
          id: true,
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

      return updatedAsset;
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
    } finally {
      this.lockService.releaseLock(`asset-${id}`);
    }
  }

  async delete(location: Location, id: number) {
    if (!Object.values(Location).includes(location)) {
      throw new BadRequestException(Messages.ASSET.FAILED.INVALID_LOCATION);
    }

    const asset = await this.prismaService.asset.findUnique({
      where: {
        id,
      },
      include: {
        assignments: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException(Messages.ASSET.FAILED.NOT_FOUND);
    }

    if (asset.location !== location) {
      throw new ForbiddenException(Messages.ASSET.FAILED.ACCESS_DENIED);
    }

    if (asset.assignments.length > 0) {
      throw new ConflictException(Messages.ASSET.FAILED.DELETE_DENIED);
    }

    try {
      await this.prismaService.asset.delete({
        where: {
          id,
        },
      });

      return {
        message: Messages.ASSET.SUCCESS.DELETED,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  public updateState(assetCode: string, state: AssetState) {
    return this.prismaService.asset.update({
      where: {
        assetCode,
      },
      data: {
        state,
      },
    });
  }
}
