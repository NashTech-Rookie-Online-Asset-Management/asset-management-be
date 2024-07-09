import { adminMockup, createUserDto, result } from './config/mock-data';
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
  describe('create', () => {
    it('should create a user successfully', async () => {
      mockUsersService.create.mockResolvedValue(result);

      expect(await controller.create(adminMockup, createUserDto)).toEqual(
        result,
      );
      expect(usersService.create).toHaveBeenCalledWith(
        adminMockup,
        createUserDto,
      );
    });

    it('should throw an error if the user creation fails', async () => {
      mockUsersService.create.mockRejectedValue(
        new Error('Failed to create user'),
      );

      await expect(
        controller.create(adminMockup, createUserDto),
      ).rejects.toThrow('Failed to create user');
      expect(usersService.create).toHaveBeenCalledWith(
        adminMockup,
        createUserDto,
      );
    });
  });
});
