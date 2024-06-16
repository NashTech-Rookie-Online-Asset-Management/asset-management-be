import { PrismaService } from './../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { PayloadType } from './types';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
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
    if (user.status === 'DISABLED') {
      throw new UnauthorizedException('This account is disabled.');
    }
    const passwordValid = await bcrypt.compare(
      authPayload.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Username or password is incorrect. Please try again.',
      );
    }
    return this.generateLoginResponse(user);
  }

  private async generateLoginResponse(user): Promise<LoginResponseDto> {
    const payload: PayloadType = {
      username: user.username,
      sub: user.id,
      staffCode: user.staffCode,
      status: user.status,
      type: user.type,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1h',
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: '1d',
      }),
    };
  }
}
