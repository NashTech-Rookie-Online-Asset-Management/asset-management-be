import { Location } from '@prisma/client';
import {
  mockPrismaService,
  service,
  setupTestModule,
} from './config/test-setup';
import { user } from './config/mock-data';

describe('UsersService', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should get user', async () => {
      const staffCode = 'SD0001';
      const expected = {
        id: 2,
        staffCode: staffCode,
        firstName: 'John',
        lastName: 'Doe',
        username: 'johnd',
        location: Location.HCM,
      };

      (mockPrismaService.account.findFirst as jest.Mock).mockResolvedValueOnce(
        expected,
      );

      const result = await service.selectOne(staffCode, user);

      expect(result).toEqual(expected);
      expect(mockPrismaService.account.findFirst).toHaveBeenCalledWith({
        where: { staffCode },
        select: {
          id: true,
          staffCode: true,
          firstName: true,
          lastName: true,
          fullName: true,
          username: true,
          dob: true,
          gender: true,
          joinedAt: true,
          type: true,
          location: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });
});
