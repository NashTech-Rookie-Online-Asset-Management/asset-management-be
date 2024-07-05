import { UpdateUserDto } from 'src/users/dto';
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

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userStaffCode = 'SD0001';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('2000-01-01'),
        gender: 'MALE',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      const result = {
        staffCode: 'SD0001',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      mockUsersService.update = jest.fn().mockResolvedValue(result);

      expect(
        await controller.update(adminMockup, userStaffCode, updateUserDto),
      ).toEqual(result);
      expect(usersService.update).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
        updateUserDto,
      );
    });

    it('should throw an error if the user update fails', async () => {
      const userStaffCode = 'SD0001';
      const updateUserDto: UpdateUserDto = {
        dob: new Date('2000-01-01'),
        gender: 'MALE',
        joinedAt: new Date('2024-06-17'),
        type: 'ADMIN',
      };

      mockUsersService.update = jest
        .fn()
        .mockRejectedValue(new Error('Failed to update user'));

      await expect(
        controller.update(adminMockup, userStaffCode, updateUserDto),
      ).rejects.toThrow('Failed to update user');
      expect(usersService.update).toHaveBeenCalledWith(
        adminMockup,
        userStaffCode,
        updateUserDto,
      );
    });
  });
});
