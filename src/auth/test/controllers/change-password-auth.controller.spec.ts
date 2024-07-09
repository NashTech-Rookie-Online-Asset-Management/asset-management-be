import { UnauthorizedException } from '@nestjs/common';
import {
  authService,
  controller,
  setupTestController,
} from './config/test-setup';
import { ChangePasswordDto } from 'src/auth/dto';

describe('AuthController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
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
        mockUserId,
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
        controller.changePassword(mockUserId, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
