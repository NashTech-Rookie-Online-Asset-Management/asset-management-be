import { BadRequestException, Injectable } from '@nestjs/common';
import {
  Account,
  AccountType,
  AssetState,
  AssignmentState,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  AssetPaginationDto,
  AssignmentDto,
  UserPaginationDto,
  UserSortKey,
} from './assignment.dto';
import { Messages } from 'src/common/constants';
import { AssetService } from 'src/asset/asset.service';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly assetService: AssetService,
  ) {}

  async getAvailableUser(user: Account, pagination: UserPaginationDto) {
    const search = pagination.search.toLowerCase();
    const where = {
      location: user.location,
      NOT: [
        {
          id: user.id,
        },
        {
          type: AccountType.ROOT,
        },
      ],
    };

    const orderBy = [];
    switch (pagination.sortField) {
      case UserSortKey.STAFF_CODE:
        orderBy.push({
          staffCode: pagination.sortOrder,
        });
        break;
      case UserSortKey.FULL_NAME:
        orderBy.push({
          firstName: pagination.sortOrder,
        });
        orderBy.push({
          lastName: pagination.sortOrder,
        });
        break;
      default:
        break;
    }

    const [count, data] = await Promise.all([
      this.prismaService.account.count({
        where: {
          ...where,
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              staffCode: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
      this.prismaService.account.findMany({
        where: {
          ...where,
          OR: [
            {
              firstName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              lastName: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              staffCode: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
        orderBy,
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
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
    };

    const [count, data] = await Promise.all([
      this.prismaService.asset.count({
        where: {
          ...where,
          OR: [
            {
              assetCode: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },
      }),

      this.prismaService.asset.findMany({
        where: {
          ...where,
          OR: [
            {
              assetCode: {
                contains: search,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          ],
        },

        orderBy: {
          [pagination.sortField]: pagination.sortOrder,
        },

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

  getOne(user: Account, id: number) {
    return this.prismaService.assignment.findFirst({
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
            firstName: true,
            lastName: true,
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
      },
    });
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

    if (editUser.id !== assignment.assignedById) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_YOURS,
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

    // Check if assignment date is in the past
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (new Date(dto.assignedDate) <= yesterday) {
      throw new BadRequestException(
        Messages.ASSIGNMENT.FAILED.DATE_IN_THE_PAST,
      );
    }
  }
}
// Khi tao -> Check asset available
// Khi update ma khong update asset -> Khong check asset available
// Khi update co update asset -> Check asset available
