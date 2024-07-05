import { adminMockup } from './config/mock-data';
import {
  controller,
  mockUsersService,
  setupTestController,
  usersService,
} from './config/test-setup';

describe('UsersController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('disabledUser', () => {
    it('should disable a user successfully', async () => {
      const userStaffCode = 'SD0002';
      const result = { success: true };

      mockUsersService.disable.mockResolvedValue(result);

      expect(await controller.disabledUser(adminMockup, userStaffCode)).toEqual(
        result,
      );
      expect(usersService.disable).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
      );
    });

    it('should throw an error if disabling the user fails', async () => {
      const userStaffCode = 'SD0001';

      mockUsersService.disable.mockRejectedValue(
        new Error('Failed to disable user'),
      );

      await expect(
        controller.disabledUser(adminMockup, userStaffCode),
      ).rejects.toThrow('Failed to disable user');
      expect(usersService.disable).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
      );
    });
  });
});
