import { PrismaService } from './../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PayloadType } from './types';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { Account, UserStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AuthPayloadDto, LoginResponseDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(authPayload: AuthPayloadDto) {
    const user = await this.prismaService.account.findUnique({
      where: { username: authPayload.username },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Username or password is incorrect. Please try again',
      );
    }
    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException('This account is disabled.');
    }
    const isPasswordValid = await bcrypt.compare(
      authPayload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Username or password is incorrect. Please try again.',
      );
    }
    return this.generateLoginResponse(user);
  }

  private async generateLoginResponse(
    user: Account,
  ): Promise<LoginResponseDto> {
    const payload: PayloadType = {
      username: user.username,
      sub: user.id,
      staffCode: user.staffCode,
      status: user.status,
      type: user.type,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_DURATION.ACCESS_TOKEN'),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_DURATION.REFRESH_TOKEN'),
      }),
    };
  }
}
