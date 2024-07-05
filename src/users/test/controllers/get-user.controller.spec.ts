import { AccountType, Location, UserStatus } from '@prisma/client';
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

  describe('getUser', () => {
    const user = {
      id: 1,
      staffCode: 'SD0001',
      username: 'nicolad',
      status: UserStatus.ACTIVE,
      type: AccountType.ADMIN,
      location: Location.HCM,
    };
    it('should return a user successfully', async () => {
      const staffCode = 'SD0001';

      const result = {
        id: '1',
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        joinedAt: new Date('2024-06-17'),
        type: AccountType.ADMIN,
        location: Location.HCM,
      };

      mockUsersService.selectOne.mockResolvedValue(result);

      expect(await controller.getUser(staffCode, user)).toEqual(result);
      expect(usersService.selectOne).toHaveBeenCalledWith(staffCode, user);
    });

    it('should throw an error if retrieving the user fails', async () => {
      const username = 'johnd';

      mockUsersService.selectOne.mockRejectedValue(
        new Error('Failed to retrieve user'),
      );

      await expect(controller.getUser(username, user)).rejects.toThrow(
        'Failed to retrieve user',
      );
      expect(usersService.selectOne).toHaveBeenCalledWith(username, user);
    });
  });
});
