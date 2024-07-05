import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Account, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from './../prisma/prisma.service';
import {
  AuthPayloadDto,
  ChangePasswordDto,
  ChangePasswordFirstTimeDto,
  LoginResponseDto,
  RefreshTokenDto,
} from './dto';
import { Messages } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(authPayload: AuthPayloadDto) {
    const user = await this.findUser(
      { username: authPayload.username },
      Messages.AUTH.FAILED.LOGIN,
    );
    if (user.status === UserStatus.DISABLED) {
      throw new UnauthorizedException(Messages.USER.FAILED.DISABLED);
    }
    const passwordValid = await bcrypt.compare(
      authPayload.password,
      user.password,
    );

    if (!passwordValid) {
      throw new UnauthorizedException(Messages.AUTH.FAILED.LOGIN);
    }
    return this.generateLoginResponse(user);
  }

  async changePasswordFirstTime(
    userStaffCode: string,
    changePasswordFirstTimeDto: ChangePasswordFirstTimeDto,
  ) {
    const user = await this.findUser(
      { staffCode: userStaffCode },
      Messages.USER.FAILED.NOT_FOUND,
    );

    const isSamePassword = await bcrypt.compare(
      changePasswordFirstTimeDto.newPassword,
      user.password,
    );
    if (isSamePassword) {
      throw new BadRequestException(Messages.AUTH.FAILED.PASSWORD_NOT_SAME);
    }

    const newPasswordHash = await bcrypt.hash(
      changePasswordFirstTimeDto.newPassword,
      10,
    );
    const userUpdated = await this.prismaService.account.update({
      where: { staffCode: userStaffCode },
      data: { password: newPasswordHash, status: UserStatus.ACTIVE },
    });

    return this.generateLoginResponse(userUpdated);
  }
  async changePassword(
    userStaffCode: string,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.findUser(
      { staffCode: userStaffCode },
      Messages.USER.FAILED.NOT_FOUND,
    );

    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        Messages.AUTH.FAILED.PASSWORD_NOT_CORRECT,
      );
    }

    if (changePasswordDto.oldPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(Messages.AUTH.FAILED.PASSWORD_NOT_SAME);
    }

    const newPasswordHash = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );
    await this.prismaService.account.update({
      where: { staffCode: userStaffCode },
      data: { password: newPasswordHash, status: UserStatus.ACTIVE },
    });
    return { message: Messages.AUTH.SUCCESS.CHANGE_PASSWORD };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    if (!refreshToken) {
      throw new UnauthorizedException(Messages.TOKEN.FAILED.REFRESH_INVALID);
    }

    try {
      const decodeToken = this.jwtService.verify(refreshToken);
      const user = await this.findUser(
        { staffCode: decodeToken?.staffCode },
        Messages.USER.FAILED.NOT_FOUND,
      );

      return this.generateLoginResponse(user);
    } catch (error) {
      throw new UnauthorizedException(Messages.TOKEN.FAILED.REFRESH_EXPIRED);
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

  private async generateLoginResponse(
    user: Account,
  ): Promise<LoginResponseDto> {
    const payload = {
      username: user.username,
      sub: user.id,
      staffCode: user.staffCode,
      status: user.status,
      type: user.type,
      location: user.location,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_DURATION.ACCESS_TOKEN'),
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('EXPIRED_DURATION.REFRESH_TOKEN'),
      }),
      payload,
    };
  }
}
