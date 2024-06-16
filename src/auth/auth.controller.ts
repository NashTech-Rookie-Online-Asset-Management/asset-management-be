import { JwtAuthGuard } from './../common/guards/jwt-auth.guard';
import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getUser(@Req() req) {
    return req.user;
  }
  @Post('login')
  login(@Body() authPayload: AuthPayloadDto) {
    return this.authService.login(authPayload);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @Req() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = req.user.staffCode;

    return this.authService.changePassword(userId, changePasswordDto);
  }

  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshTokenDto) {
    return await this.authService.refresh(refreshDto);
  }
}
