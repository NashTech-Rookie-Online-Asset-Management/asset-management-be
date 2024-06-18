import { GetUser } from './../common/decorators/get-user.decorator';
import { JwtAuthGuard } from './../common/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto, ChangePasswordDto, RefreshTokenDto } from './dto';
import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';

@Controller('auth')
@ApiTags('AUTH')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUser(@Req() req) {
    return req.user;
  }
  @Post('login')
  async login(
    @Body() authPayload: AuthPayloadDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const auth = await this.authService.login(authPayload);
    res.cookie('user', auth.payload);
    res.cookie('accessToken', auth.accessToken, { httpOnly: true });

    return { accessToken: auth?.accessToken, refreshToken: auth?.refreshToken };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  changePassword(
    @GetUser('staffCode') staffCode: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = staffCode;

    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    const refresh = await this.authService.refresh(refreshDto);
    return {
      accessToken: refresh?.accessToken,
      refreshToken: refresh?.refreshToken,
    };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('user');

    return res.json({ message: 'Logout successful' });
  }
}
