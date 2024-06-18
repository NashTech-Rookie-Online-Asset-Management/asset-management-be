import { GetUser } from './../common/decorators/get-user.decorator';
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
import { AuthPayloadDto, ChangePasswordDto, RefreshTokenDto } from './dto';
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
  login(@Body() authPayload: AuthPayloadDto) {
    return this.authService.login(authPayload);
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
  refresh(@Body() refreshDto: RefreshTokenDto) {
    return this.authService.refresh(refreshDto);
  }
}
