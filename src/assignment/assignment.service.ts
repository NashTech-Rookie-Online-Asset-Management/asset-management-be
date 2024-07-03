import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  Account,
  AccountType,
  AssetState,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';

import { AssetService } from 'src/asset/asset.service';
import { Messages } from 'src/common/constants';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserType } from 'src/users/types';
import {
  AssetPaginationDto,
  AssetSortKey,
  AssignmentDto,
  AssignmentPaginationDto as AdminAssignmentPaginationDto,
  AssignmentSortKey as AdminAssignmentSortKey,
  UserPaginationDto,
} from './assignment.dto';
import {
  AssignmentPaginationDto,
  AssignmentSortKey,
  ResponseAssignmentDto,
} from './dto';
@Injectable()
export class AssignmentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly assetService: AssetService,
  ) {}

  async getAll(user: Account, dto: AdminAssignmentPaginationDto) {
    let orderBy = {};
    switch (dto.sortField) {
      case AdminAssignmentSortKey.ASSET_CODE:
        orderBy = {
          asset: {
            assetCode: dto.sortOrder,
          },
        };
        break;
      case AdminAssignmentSortKey.ASSET_NAME:
        orderBy = {
          asset: {
            name: dto.sortOrder,
          },
        };
        break;
      case AdminAssignmentSortKey.ASSIGNED_TO:
        orderBy = {
          assignedTo: {
            username: dto.sortOrder,
          },
        };
        break;
      case AdminAssignmentSortKey.ASSIGNED_BY:
        orderBy = {
          assignedBy: {
            username: dto.sortOrder,
          },
        };
        break;
      default:
        orderBy = {
          [dto.sortField]: dto.sortOrder,
        };
        break;
    }

    const where = {
      assignedBy: {
        location: user.location,
      },
      AND: [
        {
          assignedDate: {
            gte: new Date(dto.date),
          },
        },
        {
          state: {
            in: dto.states,
          },
        },
      ],
      OR: [
        {
          asset: {
            OR: [
              {
                assetCode: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                name: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          },
        },
        {
          assignedTo: {
            username: {
              contains: dto.search,
              mode: 'insensitive' as const,
            },
          },
        },
      ],
    };

    const [count, data] = await Promise.all([
      this.prismaService.assignment.count({ where }),
      this.prismaService.assignment.findMany({
        where,
        orderBy,
        take: dto.take,
        skip: dto.skip,
        include: {
          assignedBy: {
            select: {
              username: true,
              staffCode: true,
              fullName: true,
              type: true,
              location: true,
            },
          },
          asset: {
            select: {
              assetCode: true,
              name: true,
              category: true,
              location: true,
            },
          },
          assignedTo: {
            select: {
              username: true,
              staffCode: true,
              fullName: true,
              type: true,
              location: true,
            },
          },
        },
      }),
    ]);

    return {
      data,
      pagination: {
        totalPages: Math.ceil(count / dto.take),
        totalCount: count,
      },
    };
  }

  async getAvailableUser(user: Account, pagination: UserPaginationDto) {
    const assignmentId = pagination.assignmentId;

    const assignment =
      assignmentId &&
      (await this.prismaService.assignment.findUnique({
        where: {
          id: Number.parseInt(assignmentId),
        },
      }));

    const assignedTo = assignment?.assignedToId;

    const search = pagination.search.toLowerCase();
    const where = {
      location: user.location,
      NOT: [
        {
          id: user.id,
        },
        {
          id: assignedTo,
        },
        {
          type: AccountType.ROOT,
        },
        {
          status: UserStatus.DISABLED,
        },
      ],
      OR: [
        {
          fullName: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          staffCode: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const [count, data] = await Promise.all([
      this.prismaService.account.count({ where }),
      this.prismaService.account.findMany({
        where,
        orderBy: [
          {
            [pagination.sortField]: pagination.sortOrder,
          },
        ],
        select: {
          staffCode: true,
          fullName: true,
          type: true,
          location: true,
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return {
      data,
      pagination: {
        totalPages: Math.ceil(count / pagination.take),
        totalCount: count,
      },
    };
  }

  async getAvailableAsset(user: Account, pagination: AssetPaginationDto) {
    const search = pagination.search.toLowerCase();
    const where = {
      state: AssetState.AVAILABLE,
      location: user.location,
      OR: [
        {
          assetCode: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
        {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        },
      ],
    };

    const orderBy = [];
    switch (pagination.sortField) {
      case AssetSortKey.ASSET_CATEGORY:
        orderBy.push({
          category: {
            name: pagination.sortOrder,
          },
        });
        break;
      default:
        orderBy.push({
          [pagination.sortField]: pagination.sortOrder,
        });
        break;
    }

    const [count, data] = await Promise.all([
      this.prismaService.asset.count({ where }),

      this.prismaService.asset.findMany({
        where,
        orderBy,
        include: {
          category: true,
        },
        skip: pagination.skip,
        take: pagination.take,
      }),
    ]);

    return {
      data,
      pagination: {
        totalPages: Math.ceil(count / pagination.take),
        totalCount: count,
      },
    };
  }

  async getOne(user: Account, id: number) {
    const result = await this.prismaService.assignment.findFirst({
      where: {
        id,
        assignedBy: {
          location: user.location,
        },
        asset: {
          location: user.location,
        },
      },
      include: {
        assignedTo: {
          select: {
            staffCode: true,
            username: true,
            fullName: true,
            type: true,
            location: true,
          },
        },
        assignedBy: {
          select: {
            staffCode: true,
            username: true,
            fullName: true,
            type: true,
            location: true,
          },
        },
        asset: {
          select: {
            assetCode: true,
            name: true,
            specification: true,
            category: true,
            location: true,
          },
        },
      },
    });
    if (!result)
      throw new NotFoundException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    return result;
  }

  async create(createdUser: Account, dto: AssignmentDto) {
    await this.validate(createdUser, dto);

    const [assignment] = await Promise.all([
      this.prismaService.assignment.create({
        data: {
          assignedDate: new Date(dto.assignedDate),
          note: dto.note,
          assignedTo: {
            connect: {
              staffCode: dto.staffCode,
            },
          },
          assignedBy: {
            connect: {
              id: createdUser.id,
            },
          },
          asset: {
            connect: {
              assetCode: dto.assetCode,
            },
          },
        },
        include: {
          assignedBy: {
            select: {
              username: true,
              staffCode: true,
              fullName: true,
              type: true,
              location: true,
            },
          },
          asset: {
            select: {
              assetCode: true,
              name: true,
              category: true,
              location: true,
            },
          },
          assignedTo: {
            select: {
              username: true,
              staffCode: true,
              fullName: true,
              type: true,
              location: true,
            },
          },
        },
      }),

      this.assetService.updateState(dto.assetCode, AssetState.ASSIGNED),
    ]);

    return assignment;
  }

  async update(editUser: Account, id: number, dto: AssignmentDto) {
    const assignment = await this.prismaService.assignment.findFirst({
      where: { id },
      include: {
        asset: true,
      },
    });

    if (!assignment) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }

    if (assignment.state !== AssignmentState.WAITING_FOR_ACCEPTANCE) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_ALREADY_CLOSED,
      );
    }

    const isDifferentAsset = assignment.asset.assetCode !== dto.assetCode;
    await this.validate(editUser, dto, isDifferentAsset);

    await this.assetService.updateState(
      assignment.asset.assetCode,
      AssetState.AVAILABLE,
    );
    await this.assetService.updateState(dto.assetCode, AssetState.ASSIGNED);

    return this.prismaService.assignment.update({
      where: { id },
      data: {
        assignedDate: new Date(dto.assignedDate),
        note: dto.note,
        assignedTo: {
          connect: {
            staffCode: dto.staffCode,
          },
        },
        asset: {
          connect: {
            assetCode: dto.assetCode,
          },
        },
      },
      include: {
        assignedBy: {
          select: {
            username: true,
            staffCode: true,
            fullName: true,
            type: true,
            location: true,
          },
        },
        asset: {
          select: {
            assetCode: true,
            name: true,
            category: true,
            location: true,
          },
        },
        assignedTo: {
          select: {
            username: true,
            staffCode: true,
            fullName: true,
            type: true,
            location: true,
          },
        },
      },
    });
  }

  private async validate(
    createdUser: Account,
    dto: AssignmentDto,
    isDifferentAsset = true,
  ) {
    const asset = await this.prismaService.asset.findUnique({
      where: {
        assetCode: dto.assetCode,
      },
    });

    const assignedUser = await this.prismaService.account.findUnique({
      where: {
        staffCode: dto.staffCode,
      },
    });

    // If create user not found
    if (!createdUser) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }

    // Check if assign user is not found
    if (!assignedUser) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.USER_NOT_FOUND);
    }

    // Check if assign user is root
    if (assignedUser.type === AccountType.ROOT) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.USER_IS_ROOT);
    }

    // If asset not found
    if (!asset) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.ASSET_NOT_FOUND);
    }

    // Check asset is available
    if (isDifferentAsset && asset.state !== AssetState.AVAILABLE) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_AVAILABLE,
      );
    }

    // Check user is not the same
    if (createdUser.id === assignedUser.id) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.USER_NOT_THE_SAME,
      );
    }

    // Check if user is in the same location
    if (createdUser.location !== assignedUser.location) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    }

    // Check if asset is in the same location
    if (createdUser.location !== asset.location) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.ASSET_NOT_IN_SAME_LOCATION,
      );
    }

    // Check if user is disable
    if (assignedUser.status === UserStatus.DISABLED) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.USER_DISABLED);
    }

    // Check if assignment date is in the past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (new Date(dto.assignedDate) <= yesterday) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.DATE_IN_THE_PAST,
      );
    }
  }

  async requestReturn(user: UserType, assignmentId: number) {
    const assignment = await this.prismaService.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        asset: true,
        assignedTo: true,
      },
    });

    if (!assignment) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }

    if (
      user.type !== AccountType.ROOT &&
      user.location !== assignment.assignedTo.location
    ) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    }

    if (assignment.state !== AssignmentState.ACCEPTED) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.NOT_ACCEPTED);
    }

    if (
      user.type === AccountType.STAFF &&
      user.staffCode !== assignment.assignedTo.staffCode
    ) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.NOT_YOURS);
    }
    const returnRequest = await this.prismaService.returningRequest.create({
      data: {
        assignmentId: assignment.id,
        requestedById: user.id,
        acceptedById: null,
        returnedDate: null,
        state: RequestState.WAITING_FOR_RETURNING,
      },
    });
    await this.prismaService.assignment.update({
      where: { id: assignment.id },
      data: { state: AssignmentState.IS_REQUESTED },
    });
    return returnRequest;
  }

  async responseAssignedAssignment(
    user: UserType,
    assignmentId: number,
    dto: ResponseAssignmentDto,
  ) {
    const { state } = dto;
    const assignment = await this.prismaService.assignment.findUnique({
      where: {
        id: assignmentId,
      },
      include: {
        asset: true,
        assignedTo: true,
      },
    });
    if (!assignment) {
      throw new NotFoundException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }
    if (
      user.type !== AccountType.ROOT &&
      user.location !== assignment.assignedTo.location
    ) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    }

    if (assignment.state !== AssignmentState.WAITING_FOR_ACCEPTANCE) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.NOT_WAITING_FOR_ACCEPTANCE,
      );
    }

    if (
      user.type !== AccountType.ROOT &&
      user.staffCode !== assignment.assignedTo.staffCode
    ) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.NOT_YOURS);
    }

    if (state) {
      await this.prismaService.assignment.update({
        where: { id: assignment.id },
        data: { state: AssignmentState.ACCEPTED },
      });

      return { message: Messages.ASSIGNMENT.SUCCESS.ACCEPTED };
    } else {
      await this.prismaService.assignment.update({
        where: { id: assignment.id },
        data: { state: AssignmentState.DECLINED },
      });

      await this.prismaService.asset.update({
        where: {
          id: assignment.assetId,
        },
        data: {
          state: AssetState.AVAILABLE,
        },
      });
      return { message: Messages.ASSIGNMENT.SUCCESS.DECLINED };
    }
  }

  async getUserAssignments(
    user: UserType,
    pagination: AssignmentPaginationDto,
  ) {
    const currentDate = new Date();
    const orderBy = [];

    if (pagination.sortField && pagination.sortOrder) {
      switch (pagination.sortField) {
        case AssignmentSortKey.ASSET_CODE:
          orderBy.push({ asset: { assetCode: pagination.sortOrder } });
          break;
        case AssignmentSortKey.ASSET_NAME:
          orderBy.push({ asset: { name: pagination.sortOrder } });
          break;
        case AssignmentSortKey.CATEGORY:
          orderBy.push({ asset: { category: { name: pagination.sortOrder } } });
          break;
        case AssignmentSortKey.ASSIGNED_DATE:
          orderBy.push({ assignedDate: pagination.sortOrder });
          break;
        case AssignmentSortKey.STATE:
          orderBy.push({ state: pagination.sortOrder });
          break;
        default:
          break;
      }
    }
    const whereConditions = {
      assignedToId: user.id,
      assignedDate: {
        lte: currentDate,
      },
      state: {
        not: AssignmentState.DECLINED,
      },
      OR: [
        { returningRequest: null },
        { returningRequest: { state: { not: RequestState.COMPLETED } } },
      ],
      ...(pagination.search && {
        asset: {
          name: {
            contains: pagination.search,
            mode: 'insensitive' as const,
          },
        },
      }),
    };
    const [count, assignments] = await Promise.all([
      this.prismaService.assignment.count({
        where: whereConditions,
      }),

      this.prismaService.assignment.findMany({
        where: whereConditions,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        include: {
          assignedBy: {
            select: {
              staffCode: true,
              fullName: true,
            },
          },
          asset: {
            select: {
              assetCode: true,
              name: true,
              category: true,
            },
          },
        },
      }),
    ]);
    return {
      data: assignments,
      pagination: {
        totalPages: Math.ceil(count / pagination.take),
        totalCount: count,
      },
    };
  }

  async delete(location: Location, id: number) {
    if (!Object.values(Location).includes(location)) {
      throw new BadRequestException(Messages.ASSET.FAILED.INVALID_LOCATION);
    }

    const assignment = await this.prismaService.assignment.findUnique({
      where: {
        id,
      },
      include: {
        asset: {
          select: {
            location: true,
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    }

    if (assignment.asset.location !== location) {
      throw new ForbiddenException(Messages.ASSIGNMENT.FAILED.ACCESS_DENIED);
    }

    if (
      assignment.state !== AssignmentState.WAITING_FOR_ACCEPTANCE &&
      assignment.state !== AssignmentState.DECLINED
    ) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.DELETE_DENIED);
    }

    try {
      await this.prismaService.assignment.delete({
        where: {
          id,
        },
      });

      return {
        message: Messages.ASSIGNMENT.SUCCESS.DELETED,
      };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
// Khi tao -> Check asset available
// Khi update ma khong update asset -> Khong check asset available
// Khi update co update asset -> Check asset available
