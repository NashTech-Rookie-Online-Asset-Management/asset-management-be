import { UnauthorizedException } from '@nestjs/common';
import {
  authService,
  controller,
  setupTestController,
} from './config/test-setup';
import { LoginResponseDto, RefreshTokenDto } from 'src/auth/dto';

describe('AuthController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('refresh', () => {
    it('should return new tokens on valid refresh token', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid_refresh_token',
      };

      const mockedLoginResponse: LoginResponseDto = {
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
        payload: {
          // Ensure payload matches what AuthService.refresh returns
          username: 'abc',
          sub: 1,
        },
      };

      jest.spyOn(authService, 'refresh').mockResolvedValue(mockedLoginResponse);

      const result = await controller.refresh(refreshTokenDto);

      // Adjust the expectation based on what AuthService.refresh returns
      expect(result).toEqual({
        accessToken: 'mocked.accessToken',
        refreshToken: 'mocked.refreshToken',
        // Add 'payload' if it's returned by AuthService.refresh
      });
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
