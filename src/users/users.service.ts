import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Account,
  AccountType,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Messages } from 'src/common/constants';
import {
  formatDate,
  formatFirstName,
  isAtLeast18YearsAfter,
} from '../common/utils';
import { PrismaService } from './../prisma/prisma.service';
import {
  CreateUserDto,
  FindAllUsersSortKey,
  UpdateUserDto,
  UserPaginationDto,
} from './dto';
import { UserType } from './types';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(admin: UserType, createUserDto: CreateUserDto) {
    const { firstName, lastName, gender, type, location } = createUserDto;
    const fullName = `${firstName} ${lastName}`;
    const dob = new Date(createUserDto.dob);
    const joinedAt = new Date(createUserDto.joinedAt);

    if (!Object.values(Location).includes(admin.location)) {
      throw new BadRequestException(Messages.ASSET.FAILED.INVALID_LOCATION);
    }

    if (admin.type === createUserDto.type) {
      throw new BadRequestException(Messages.USER.FAILED.CREATE_SAME_TYPE);
    }
    const userLocation =
      admin.type === AccountType.ADMIN
        ? admin.location
        : location || admin.location;

    //generate staffCode
    const staffCode = await this.generateUniqueStaffCode();
    //generate username
    const username = await this.generateUsername(firstName, lastName);
    //generate password
    const password = this.generatePassword(username, dob);
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const userCreated = await this.prismaService.account.create({
        data: {
          staffCode,
          firstName,
          lastName,
          fullName,
          dob,
          joinedAt,
          gender,
          type,
          username,
          password: hashedPassword,
          location: userLocation,
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          username: true,
          joinedAt: true,
          location: true,
          password: true,
          type: true,
        },
      });
      userCreated.password = password;
      return userCreated;
    } catch (error) {
      throw new BadRequestException(Messages.USER.FAILED.CREATE);
    }
  }

  async update(
    admin: UserType,
    userStaffCode: string,
    updateUserDto: UpdateUserDto,
  ) {
    try {
      if (admin.staffCode === userStaffCode) {
        throw new BadRequestException(Messages.USER.FAILED.UPDATE_SELF);
      }

      const userExisted = await this.findUser(
        { staffCode: userStaffCode },
        Messages.USER.FAILED.NOT_FOUND,
      );

      if (
        userExisted.location !== admin.location &&
        admin.type === AccountType.ADMIN
      ) {
        throw new BadRequestException(
          Messages.USER.FAILED.UPDATE_NOT_SAME_LOCATION,
        );
      }

      if (userExisted.type === admin.type) {
        throw new BadRequestException(Messages.USER.FAILED.UPDATE_SAME_TYPE);
      }

      const { dob, gender, joinedAt, type } = updateUserDto;
      if (dob) {
        const newDate = new Date(dob);
        userExisted.dob = newDate;
      }
      if (joinedAt) {
        const newJoinedAt = new Date(joinedAt);
        const dobToCheck = dob ? new Date(dob) : userExisted.dob;
        this.validateJoinedDate(dobToCheck, newJoinedAt);
        userExisted.joinedAt = newJoinedAt;
      }
      if (gender) {
        userExisted.gender = gender;
      }

      if (type) {
        userExisted.type = type;
      }
      const userUpdated = await this.prismaService.account.update({
        where: { staffCode: userStaffCode },
        data: {
          dob: userExisted.dob,
          gender: userExisted.gender,
          joinedAt: userExisted.joinedAt,
          type: userExisted.type,
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          dob: true,
          gender: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
      return userUpdated;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
  private async generateUniqueStaffCode(): Promise<string> {
    const prefix = 'SD';
    let count = await this.prismaService.account.count();
    let staffCode: string;

    do {
      count++;
      staffCode = `${prefix}${count.toString().padStart(4, '0')}`;
      const existingUser = await this.prismaService.account.findUnique({
        where: { staffCode },
      });
      if (!existingUser) {
        break;
      }
    } while (true);

    return staffCode;
  }
  private async generateUsername(
    firstName: string,
    lastName: string,
  ): Promise<string> {
    const firstNamePart = formatFirstName(firstName);
    const lastNameParts = lastName.toLowerCase().trim().split(' ');
    const lastNameInitials = lastNameParts
      .map((part) => part.charAt(0))
      .join('');

    const baseUsername = `${firstNamePart}${lastNameInitials}`;

    // Fetch all conflicting usernames from the database in one go
    const conflictingUsernames =
      await this.fetchConflictingUsernames(baseUsername);
    const usernameSet = new Set(conflictingUsernames);

    // Generate a unique username
    let counter = 0;
    let uniqueUsername = baseUsername;
    while (usernameSet.has(uniqueUsername)) {
      counter += 1;
      uniqueUsername = `${baseUsername}${counter}`;
    }

    return uniqueUsername;
  }

  private validateJoinedDate(dob: Date, joinedAt: Date) {
    if (!isAtLeast18YearsAfter(dob, joinedAt)) {
      throw new BadRequestException(Messages.USER.FAILED.JOINED_DATE_UNDER_AGE);
    }

    if (joinedAt <= dob) {
      throw new BadRequestException(Messages.USER.FAILED.JOINED_AFTER_DOB);
    }
    const dayOfWeek = joinedAt.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      throw new BadRequestException(Messages.USER.FAILED.JOINED_WEEKEND);
    }
  }

  private async fetchConflictingUsernames(
    baseUsername: string,
  ): Promise<string[]> {
    const similarUsernames = await this.prismaService.account.findMany({
      where: {
        username: {
          startsWith: baseUsername,
        },
      },
      select: {
        username: true,
      },
    });
    if (!similarUsernames || similarUsernames.length === 0) {
      return [];
    }

    return similarUsernames.map((user) => user.username);
  }

  private async findUser(
    where: { username: string } | { staffCode: string },
    message: string,
  ) {
    const user = await this.prismaService.account.findUnique({ where });

    if (!user) {
      throw new UnauthorizedException(message);
    }

    return user;
  }
  private generatePassword(username: string, dob: Date): string {
    const formattedDOB = formatDate(dob);
    return `${username}@${formattedDOB}`;
  }

  async selectMany(username: string, admin: UserType, dto: UserPaginationDto) {
    const orderBy = [];
    switch (dto.sortField) {
      case FindAllUsersSortKey.FIRST_NAME:
        orderBy.push({
          firstName: dto.sortOrder,
        });
        break;
      case FindAllUsersSortKey.STAFF_CODE:
        orderBy.push({
          staffCode: dto.sortOrder,
        });
        break;
      case FindAllUsersSortKey.JOINDED_AT:
        orderBy.push({
          joinedAt: dto.sortOrder,
        });
        break;
      case FindAllUsersSortKey.TYPE:
        orderBy.push({
          type: dto.sortOrder,
        });
        break;
      default:
        break;
    }

    const searchClause = {
      OR: [],
    };

    if (/\d+/.test(dto.search ?? '') == false && dto.search?.length > 0) {
      searchClause.OR.push({
        fullName: {
          contains: dto.search,
          mode: 'insensitive' as const,
        },
      });
    }

    if (dto.search?.length <= 6) {
      searchClause.OR.push({
        staffCode: {
          contains: dto.search,
          mode: 'insensitive' as const,
        },
      });
    }

    if (dto.search?.length >= 264) {
      return {
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      };
    }

    const conditions = {
      where: {
        ...(admin.type !== AccountType.ROOT
          ? { location: admin.location }
          : {}),
        username: {
          not: username,
        },
        ...(searchClause.OR.length > 0 && searchClause),
        status: {
          not: UserStatus.DISABLED,
        },
        ...(dto.types &&
          dto.types.length > 0 && {
            type: {
              in: dto.types,
            },
          }),
      },
      orderBy,
    };

    const pageOptions = {
      take: dto.take,
      skip: dto.skip,
    };

    const [users, totalCount] = await Promise.all([
      this.prismaService.account.findMany({
        ...conditions,
        ...pageOptions,

        include: {
          assignedTos: {
            where: {
              state: {
                in: [
                  AssignmentState.WAITING_FOR_ACCEPTANCE,
                  AssignmentState.ACCEPTED,
                  AssignmentState.IS_REQUESTED,
                ],
              },
            },
            include: {
              returningRequest: {
                where: {
                  state: RequestState.WAITING_FOR_RETURNING,
                },
              },
            },
          },
        },
      }),
      this.prismaService.account.count({
        ...conditions,
      }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        staffCode: user.staffCode,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        username: user.username,
        joinedAt: user.joinedAt,
        type: user.type,
        canDisable: !user.assignedTos.some(
          (assignment) =>
            (
              [
                AssignmentState.WAITING_FOR_ACCEPTANCE,
                AssignmentState.ACCEPTED,
              ] as AssignmentState[]
            ).includes(assignment.state) ||
            (assignment.state === AssignmentState.IS_REQUESTED &&
              assignment.returningRequest &&
              assignment.returningRequest.state ===
                RequestState.WAITING_FOR_RETURNING),
        ),
      })),
      pagination: {
        totalPages: Math.ceil(totalCount / dto.take),
        totalCount,
      },
    };
  }

  async selectOne(
    username: string,
    liveUser: Partial<Account>,
  ): Promise<Partial<Account>> {
    const user = await this.prismaService.account.findFirst({
      where: {
        username,
      },
      select: {
        id: true,
        staffCode: true,
        firstName: true,
        lastName: true,
        fullName: true,
        dob: true,
        gender: true,
        type: true,
        joinedAt: true,
        username: true,
        location: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(Messages.USER.FAILED.NOT_FOUND);
    }
    if (
      liveUser.type !== AccountType.ROOT &&
      user.location !== liveUser.location
    ) {
      throw new ForbiddenException(Messages.USER.FAILED.VIEW_NOT_SAME_LOCATION);
    }
    if (user.status === UserStatus.DISABLED) {
      throw new ForbiddenException(Messages.USER.FAILED.DISABLED);
    }
    if (user.id === liveUser.id) {
      throw new ForbiddenException(Messages.USER.FAILED.VIEW_SELF);
    }

    return user;
  }

  async disable(admin: UserType, userStaffCode: string) {
    const userExisted = await this.prismaService.account.findUnique({
      where: { staffCode: userStaffCode },
      include: {
        assignedTos: {
          where: {
            state: {
              in: [
                AssignmentState.WAITING_FOR_ACCEPTANCE,
                AssignmentState.ACCEPTED,
                AssignmentState.IS_REQUESTED,
              ],
            },
          },
          include: {
            returningRequest: {
              where: {
                state: RequestState.WAITING_FOR_RETURNING,
              },
            },
          },
        },
      },
    });

    if (!userExisted) {
      throw new BadRequestException(Messages.USER.FAILED.NOT_FOUND);
    }
    if (
      admin.type === AccountType.ADMIN &&
      admin.location !== userExisted.location
    ) {
      throw new BadRequestException(
        Messages.USER.FAILED.DISABLED_NOT_SAME_LOCATION,
      );
    }
    if (admin.id === userExisted.id) {
      throw new BadRequestException(Messages.USER.FAILED.DISABLE_OWN_ACCOUNT);
    }
    if (admin.type === userExisted.type) {
      throw new BadRequestException(Messages.USER.FAILED.DISABLE_SAME_TYPE);
    }

    if (userExisted.status === UserStatus.DISABLED) {
      throw new BadRequestException(Messages.USER.FAILED.DISABLED_ALREADY);
    }

    if (
      admin.type === AccountType.ADMIN &&
      userExisted.type === AccountType.ROOT
    ) {
      throw new BadRequestException(Messages.USER.FAILED.DISABLED_ROOT);
    }
    const hasValidAssignments = userExisted.assignedTos.some(
      (assignment) =>
        (
          [
            AssignmentState.WAITING_FOR_ACCEPTANCE,
            AssignmentState.ACCEPTED,
          ] as AssignmentState[]
        ).includes(assignment.state) ||
        (assignment.state === AssignmentState.IS_REQUESTED &&
          assignment.returningRequest &&
          assignment.returningRequest.state ===
            RequestState.WAITING_FOR_RETURNING),
    );

    if (hasValidAssignments) {
      throw new BadRequestException(Messages.USER.FAILED.DISABLED_FAILED);
    }

    const updatedUser = await this.prismaService.account.update({
      where: { staffCode: userStaffCode },
      data: { status: UserStatus.DISABLED },
      select: {
        staffCode: true,
        firstName: true,
        lastName: true,
        username: true,
        status: true,
      },
    });

    return updatedUser;
  }
}
