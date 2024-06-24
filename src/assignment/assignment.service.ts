import { BadRequestException, Injectable } from '@nestjs/common';
import { Account, AccountType, AssetState } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAssignmentDto } from './assignment.dto';
import { Messages } from 'src/common/constants';

@Injectable()
export class AssignmentService {
  constructor(private readonly prismaService: PrismaService) {}

  getAvailableUser(user: Account) {
    return this.prismaService.account.findMany({
      where: {
        location: user.location,
        NOT: [
          {
            id: user.id,
          },
          {
            type: AccountType.ROOT,
          },
        ],
      },
      select: {
        staffCode: true,
        firstName: true,
        lastName: true,
        type: true,
        location: true,
      },
    });
  }

  getAvailableAsset(user: Account) {
    return this.prismaService.asset.findMany({
      where: {
        state: AssetState.AVAILABLE,
        location: user.location,
      },
      include: {
        category: true,
      },
    });
  }

  async create(createdUser: Account, dto: CreateAssignmentDto) {
    // Validate the assignment
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

      this.prismaService.asset.update({
        where: {
          assetCode: dto.assetCode,
        },
        data: {
          state: AssetState.ASSIGNED,
        },
      }),
    ]);

    return assignment;
  }

  private async validate(createdUser: Account, dto: CreateAssignmentDto) {
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

    // // Check if assign user is root
    if (assignedUser.type === AccountType.ROOT) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.USER_IS_ROOT);
    }

    // If asset not found
    if (!asset) {
      throw new BadRequestException(Messages.ASSIGNMENT.FAILED.ASSET_NOT_FOUND);
    }

    // Check asset is available
    if (asset.state !== AssetState.AVAILABLE) {
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
