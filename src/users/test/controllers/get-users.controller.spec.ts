import { UserPaginationDto } from 'src/users/dto';
import { adminMockup } from './config/mock-data';
import {
  controller,
  mockUsersService,
  setupTestController,
  usersService,
} from './config/test-setup';
import { Location } from '@prisma/client';

describe('UsersController', () => {
  beforeEach(async () => {
    await setupTestController();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return a list of users successfully', async () => {
      const username = 'admin';
      const dto: UserPaginationDto = { page: 1, take: 10, skip: 1 };

      const result = [
        {
          staffCode: 'SD0001',
          firstName: 'John',
          lastName: 'Doe',
          username: 'johnd',
          joinedAt: new Date('2024-06-17'),
          type: 'ADMIN',
          location: Location.HCM,
        },
      ];

      mockUsersService.selectMany.mockResolvedValue(result);

      expect(await controller.getUsers(username, adminMockup, dto)).toEqual(
        result,
      );
      expect(usersService.selectMany).toHaveBeenCalledWith(
        username,
        adminMockup,
        dto,
      );
    });

    it('should throw an error if retrieving users fails', async () => {
      const username = 'admin';
      const dto: UserPaginationDto = { page: 1, take: 10, skip: 1 };

      mockUsersService.selectMany.mockRejectedValue(
        new Error('Failed to retrieve users'),
      );

      await expect(
        controller.getUsers(username, adminMockup, dto),
      ).rejects.toThrow('Failed to retrieve users');
      expect(usersService.selectMany).toHaveBeenCalledWith(
        username,
        adminMockup,
        dto,
      );
    });
  });
});
