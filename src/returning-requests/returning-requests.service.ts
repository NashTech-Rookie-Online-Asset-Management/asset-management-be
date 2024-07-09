import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AccountType,
  AssetState,
  AssignmentState,
  Location,
  RequestState,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import {
  FindAllReturningRequestsSortKey,
  ReturningRequestPageOptions,
  ToggleReturnRequestDto,
} from './dto';

@Injectable()
export class ReturningRequestsService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAll(location: Location, dto: ReturningRequestPageOptions) {
    if (!Object.values(Location).includes(location)) {
      throw new BadRequestException(
        Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION,
      );
    }

    let startDate, endDate;
    if (dto.returnedDate) {
      startDate = new Date(dto.returnedDate);
      endDate = new Date(dto.returnedDate);
      endDate.setDate(endDate.getDate() + 1);
    }

    const conditions = {
      where: {
        ...(dto.search &&
          dto.search.length > 0 && {
            OR: [
              {
                assignment: {
                  asset: {
                    assetCode: {
                      contains: dto.search,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
              {
                assignment: {
                  asset: {
                    name: {
                      contains: dto.search,
                      mode: 'insensitive' as const,
                    },
                  },
                },
              },
              {
                requestedBy: {
                  username: {
                    contains: dto.search,
                    mode: 'insensitive' as const,
                  },
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
        ...(dto.returnedDate && {
          returnedDate: {
            gte: startDate,
            lt: endDate,
          },
        }),
      },
      orderBy: this.getOrderBy(dto),
    };

    const pageOptions = {
      take: dto.take,
      skip: dto.skip,
    };

    const [returningRequests, totalCount] = await Promise.all([
      this.prismaService.returningRequest.findMany({
        ...conditions,
        ...pageOptions,
        select: {
          id: true,
          assignment: {
            select: {
              asset: {
                select: {
                  assetCode: true,
                  name: true,
                },
              },
              assignedDate: true,
            },
          },
          requestedBy: {
            select: {
              username: true,
            },
          },
          acceptedBy: {
            select: {
              username: true,
            },
          },
          returnedDate: true,
          state: true,
        },
      }),
      this.prismaService.returningRequest.count({
        ...conditions,
      }),
    ]);

    return {
      data: returningRequests,
      pagination: {
        totalPages: Math.ceil(totalCount / dto.take),
        totalCount,
      },
    };
  }

  async toggleReturningRequest(
    admin: UserType,
    requestId: number,
    dto: ToggleReturnRequestDto,
  ) {
    const { state } = dto;

    const returnRequest = await this.prismaService.returningRequest.findUnique({
      where: {
        id: requestId,
      },
      include: {
        assignment: {
          include: {
            asset: true,
          },
        },
      },
    });
    if (!returnRequest) {
      throw new NotFoundException(Messages.RETURNING_REQUEST.FAILED.NOT_FOUND);
    }

    if (returnRequest.state !== RequestState.WAITING_FOR_RETURNING) {
      throw new BadRequestException(
        Messages.RETURNING_REQUEST.FAILED.INVALID_STATE,
      );
    }

    if (
      admin.type !== AccountType.ROOT &&
      admin.location !== returnRequest.assignment.asset.location
    ) {
      throw new BadRequestException(
        Messages.RETURNING_REQUEST.FAILED.INVALID_LOCATION,
      );
    }
    if (state) {
      await this.prismaService.returningRequest.update({
        where: {
          id: requestId,
        },
        data: {
          state: RequestState.COMPLETED,
          returnedDate: new Date(),
          acceptedById: admin.id,
        },
      });
      await this.prismaService.asset.update({
        where: {
          id: returnRequest.assignment.asset.id,
        },
        data: {
          state: AssetState.AVAILABLE,
        },
      });
      return { message: Messages.RETURNING_REQUEST.SUCCESS.CONFIRMED };
    } else {
      await this.prismaService.assignment.update({
        where: {
          id: returnRequest.assignment.id,
        },
        data: {
          state: AssignmentState.ACCEPTED,
        },
      });
      await this.prismaService.returningRequest.delete({
        where: { id: requestId },
      });

      return { message: Messages.RETURNING_REQUEST.SUCCESS.CANCELLED };
    }
  }

  private getOrderBy(dto: ReturningRequestPageOptions) {
    switch (dto.sortField) {
      case FindAllReturningRequestsSortKey.ASSIGNED_DATE:
        return {
          assignment: {
            assignedDate: dto.sortOrder,
          },
        };
      case FindAllReturningRequestsSortKey.ASSET_CODE:
        return {
          assignment: {
            asset: {
              assetCode: dto.sortOrder,
            },
          },
        };
      case FindAllReturningRequestsSortKey.ASSET_NAME:
        return {
          assignment: {
            asset: {
              name: dto.sortOrder,
            },
          },
        };
      case FindAllReturningRequestsSortKey.REQUESTED_BY:
      case FindAllReturningRequestsSortKey.ACCEPTED_BY:
        return {
          [dto.sortField]: {
            username: dto.sortOrder,
          },
        };
      default:
        return {
          [dto.sortField]: dto.sortOrder,
        };
    }
  }
}
