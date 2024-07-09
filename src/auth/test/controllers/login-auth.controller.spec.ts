import { UnauthorizedException } from '@nestjs/common';
import {
  authService,
  controller,
  mockResponse,
  setupTestController,
} from './config/test-setup';
import { AuthPayloadDto, LoginResponseDto } from 'src/auth/dto';
import { Response } from 'express';

describe('AuthController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
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
        payload: {
          username: 'abc',
          sub: 1,
        },
      };

      jest.spyOn(authService, 'login').mockResolvedValue(mockedLoginResponse);

      const result = await controller.login(
        authPayload,
        mockResponse as Response,
      );

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

      await expect(
        controller.login(authPayload, mockResponse as Response),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
