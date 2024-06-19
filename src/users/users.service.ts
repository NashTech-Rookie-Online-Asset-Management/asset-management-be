import * as bcrypt from 'bcryptjs';
import { Account, Location } from '@prisma/client';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { CreateUserDto, UserPageOptions } from './dto';
import { formatFirstName, formatDate } from '../common/utils';
@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(createUserDto: CreateUserDto) {
    const { firstName, lastName, gender, type, location } = createUserDto;

    const dob = new Date(createUserDto.dob);
    const joinedAt = new Date(createUserDto.joinedAt);

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
          location,
        },
        select: {
          staffCode: true,
          firstName: true,
          lastName: true,
          username: true,
          joinedAt: true,
          type: true,
        },
      });
    } catch (error) {
      throw new BadRequestException('Failed to create user.');
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
}
