import * as bcrypt from 'bcryptjs';
import {
  Account,
  AssignmentState,
  Location,
  RequestState,
  UserStatus,
} from '@prisma/client';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserPageOptions } from './dto';
import {
  formatFirstName,
  formatDate,
  isOlderThan18,
  isAtLeast18YearsAfter,
} from '../common/utils';
import { Messages } from 'src/common/constants';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(adminLocation: Location, createUserDto: CreateUserDto) {
    const { firstName, lastName, gender, type, location } = createUserDto;
    const dob = new Date(createUserDto.dob);
    const joinedAt = new Date(createUserDto.joinedAt);
    const userLocation = location ? location : adminLocation;

    //generate staffCode
    const usersCount = await this.prismaService.account.count();
    const staffCode = `SD${(usersCount + 1).toString().padStart(4, '0')}`;
    //generate username
    const username = await this.generateUsername(firstName, lastName);
    //generate password
    const password = this.generatePassword(username, dob);
    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      return await this.prismaService.account.create({
        data: {
          staffCode,
          firstName,
          lastName,
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
          dob: true,
          gender: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(Messages.USER.FAILED.CREATE);
    }
  }

  async update(userStaffCode: string, updateUserDto: UpdateUserDto) {
    try {
      const userExisted = await this.findUser(
        { staffCode: userStaffCode },
        Messages.USER.FAILED.NOT_FOUND,
      );
      const { dob, gender, joinedAt, type } = updateUserDto;
      if (dob) {
        const newDate = new Date(dob);
        if (!isOlderThan18(newDate)) {
          throw new BadRequestException(Messages.USER.FAILED.UNDER_AGE);
        }
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
          dob: true,
          gender: true,
          lastName: true,
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

  async selectMany(username: string, location: Location, dto: UserPageOptions) {
    const conditions = {
      where: {
        location: location,
        username: {
          not: username,
        },
        ...(dto.search &&
          dto.search.length > 0 && {
            OR: [
              {
                firstName: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                lastName: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
              {
                staffCode: {
                  contains: dto.search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }),
        ...(dto.types &&
          dto.types.length > 0 && {
            type: {
              in: dto.types,
            },
          }),
      },
      orderBy: [
        {
          staffCode: dto.staffCodeOrder,
        },
        {
          firstName: dto.nameOrder,
        },
        {
          joinedAt: dto.joinedDateOrder,
        },
        {
          type: dto.typeOrder,
        },
      ],
    };

    const pageOptions = {
      take: dto.take,
      skip: dto.skip,
    };

    const [users, totalCount] = await Promise.all([
      this.prismaService.account.findMany({
        ...conditions,
        ...pageOptions,

        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      }),
      this.prismaService.account.count({
        ...conditions,
      }),
    ]);

    return {
      data: users,
      pagination: {
        totalPages: Math.ceil(totalCount / dto.take),
        totalCount,
      },
    };
  }

  async selectOne(username: string): Promise<Partial<Account>> {
    return this.prismaService.account.findFirst({
      where: { username },
      select: {
        staffCode: true,
        firstName: true,
        lastName: true,
        username: true,
        dob: true,
        gender: true,
        joinedAt: true,
        type: true,
        location: true,
      },
    });
  }

  async disable(userStaffCode: string) {
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
        assignedBys: {
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
