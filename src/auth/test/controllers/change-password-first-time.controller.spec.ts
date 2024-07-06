import { adminMockup } from 'src/asset/test/controllers/config/mock-data';
import {
  authService,
  controller,
  mockAuthService,
  mockResponse,
  setupTestController,
} from './config/test-setup';
import { ChangePasswordFirstTimeDto } from 'src/auth/dto';
import { Response } from 'express';
import { Cookies, Messages } from 'src/common/constants';

describe('AuthController', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = process.env;
  });

  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('changePasswordFirstTime', () => {
    it('should change password successfully on valid old password', async () => {
      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'newpassword',
      };

      const mockResponse = {
        json: jest.fn().mockReturnThis(),
        cookie: jest.fn().mockReturnThis(),
      } as unknown as Response;

      jest.spyOn(authService, 'changePasswordFirstTime').mockResolvedValue({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        payload: {
          username: 'testuser',
          sub: 1,
        },
      });

      await controller.changePasswordFirstTime(
        adminMockup.staffCode,
        changePasswordFirstTimeDto,
        mockResponse,
      );

      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: Messages.AUTH.SUCCESS.CHANGE_PASSWORD,
      });
    });

    it('should set cookies without secure options in development', async () => {
      process.env.NODE_ENV = 'development'; // Simulating development environment

      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'newpassword',
      };

      jest.spyOn(mockAuthService, 'changePasswordFirstTime').mockResolvedValue({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        payload: {
          username: 'testuser',
          sub: 1,
        },
      });

      await controller.changePasswordFirstTime(
        'adminMockup.staffCode',
        changePasswordFirstTimeDto,
        mockResponse,
      );

      // Expectations
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        Cookies.USER,
        expect.objectContaining({
          username: 'testuser',
          sub: 1,
        }),
        expect.objectContaining({
          httpOnly: true,
        }),
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        Cookies.ACCESS_TOKEN,
        'mockAccessToken',
        expect.objectContaining({
          httpOnly: true,
        }),
      );

      expect(mockResponse.json).toHaveBeenCalledWith({
        message: Messages.AUTH.SUCCESS.CHANGE_PASSWORD,
      });
    });

    it('should set cookies without secure options in development', async () => {
      process.env.NODE_ENV = 'development';

      const changePasswordFirstTimeDto: ChangePasswordFirstTimeDto = {
        newPassword: 'newpassword',
      };

      jest.spyOn(authService, 'changePasswordFirstTime').mockResolvedValue({
        accessToken: 'mockAccessToken',
        refreshToken: 'mockRefreshToken',
        payload: {
          username: 'testuser',
          sub: 1,
        },
      });

      await controller.changePasswordFirstTime(
        adminMockup.staffCode,
        changePasswordFirstTimeDto,
        mockResponse,
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        Cookies.USER,
        expect.any(Object), // Assuming you verify the cookie payload in your specific implementation
        expect.objectContaining({
          httpOnly: true,
        }),
      );

      expect(mockResponse.cookie).toHaveBeenCalledWith(
        Cookies.ACCESS_TOKEN,
        'mockAccessToken',
        expect.objectContaining({
          httpOnly: true,
        }),
      );
    });
  });
});
