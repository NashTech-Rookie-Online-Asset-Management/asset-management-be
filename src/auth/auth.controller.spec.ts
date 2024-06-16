import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { UnauthorizedException } from '@nestjs/common';
import { LoginResponseDto } from './dto/login-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
const mockAuthService = {
  login: jest.fn(),
  changePassword: jest.fn(),
  refresh: jest.fn(),
};
describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return access and refresh tokens on successful login', async () => {
      const authPayload: AuthPayloadDto = {
        username: 'validuser',
        password: 'validpassword',
      };
      const mockedLoginResponse: LoginResponseDto = {
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockedLoginResponse);

      const result = await controller.login(authPayload);

      expect(result).toEqual({
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
      });
    });

    it('should throw UnauthorizedException on invalid credentials', async () => {
      const authPayload: AuthPayloadDto = {
        username: 'invaliduser',
        password: 'invalidpassword',
      };

      jest
        .spyOn(authService, 'login')
        .mockRejectedValue(
          new UnauthorizedException(
            'Username or password is incorrect. Please try again.',
          ),
        );

      await expect(controller.login(authPayload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    it('should change password successfully on valid old password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'oldpassword',
        newPassword: 'newpassword',
      };

      const mockUserId = 'user123';

      const successMessage = 'Your password has been changed successfully';

      jest.spyOn(authService, 'changePassword').mockResolvedValue({
        message: successMessage,
      });

      const result = await controller.changePassword(
        { user: { staffCode: mockUserId } },
        changePasswordDto,
      );

      expect(result).toEqual({ message: successMessage });
    });

    it('should throw UnauthorizedException on invalid old password', async () => {
      const changePasswordDto: ChangePasswordDto = {
        oldPassword: 'invalidoldpassword',
        newPassword: 'newpassword',
      };

      const mockUserId = 'user123';

      jest
        .spyOn(authService, 'changePassword')
        .mockRejectedValue(
          new UnauthorizedException('Old password is incorrect'),
        );

      await expect(
        controller.changePassword(
          { user: { staffCode: mockUserId } },
          changePasswordDto,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const mockedLoginResponse: LoginResponseDto = {
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
      };

      jest.spyOn(authService, 'refresh').mockResolvedValue(mockedLoginResponse);

      const result = await controller.refresh(refreshTokenDto);

      expect(result).toEqual(mockedLoginResponse);
    });

    it('should throw UnauthorizedException on invalid or expired refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid_refresh_token',
      };

      jest
        .spyOn(authService, 'refresh')
        .mockRejectedValue(
          new UnauthorizedException('Invalid or expired refresh token'),
        );

      await expect(controller.refresh(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
