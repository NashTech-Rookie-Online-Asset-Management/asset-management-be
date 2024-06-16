import { PrismaService } from './../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { PayloadType } from './types';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserStatus } from '@prisma/client';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(authPayload: AuthPayloadDto) {
    const user = await this.findUser(
      { username: authPayload.username },
      'Username or password is incorrect. Please try again',
    );
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

  async changePassword(
    userStaffCode: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.findUser(
      { staffCode: userStaffCode },
      'User not found',
    );

    const passwordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.prismaService.account.update({
      where: { staffCode: userStaffCode },
      data: { password: newPasswordHash, status: UserStatus.ACTIVE },
    });
    return { message: 'Your password has been changed successfully' };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    try {
      const decodeToken = this.jwtService.verify(refreshToken, {
        ignoreExpiration: true,
      });
      const user = await this.findUser(
        { staffCode: decodeToken.staffCode },
        'User not found',
      );

      return this.generateLoginResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
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
