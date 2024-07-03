import { AccountType } from '@prisma/client';
import { AssignmentPaginationDto, AssignmentSortKey } from 'src/assignment/dto';
import { Order } from 'src/common/constants';
import {
  controller,
  mockAssignmentService,
  setupTestController,
} from './config/test-setup';
import { assignment } from '../services/config/mock-data';
import { adminMockup } from './config/mock-data';

describe('AssignmentController', () => {
  beforeEach(async () => {
    await setupTestController(AccountType.ADMIN);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getUserAssignments', () => {
    it('Should get user assignments for admin', async () => {
      await setupTestController(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      const result = {
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });

    it('Should get user assignments with pagination and sort options', async () => {
      await setupTestController(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        sortField: AssignmentSortKey.ASSET_NAME,
        sortOrder: Order.ASC,
      };

      const result = {
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });

    it('Should get user assignments with search filter', async () => {
      await setupTestController(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
        search: 'Laptop',
      };

      const result = {
        data: [assignment],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });

    it('Should return empty assignments if no assignments found', async () => {
      await setupTestController(AccountType.ADMIN);

      const pagination: AssignmentPaginationDto = {
        page: 1,
        take: 10,
        skip: 0,
      };

      const result = {
        data: [],
        pagination: {
          totalPages: 0,
          totalCount: 0,
        },
      };

      mockAssignmentService.getUserAssignments.mockResolvedValue(result);

      expect(
        await controller.getUserAssignments(adminMockup, pagination),
      ).toEqual(result);
      expect(mockAssignmentService.getUserAssignments).toHaveBeenCalledWith(
        adminMockup,
        pagination,
      );
    });
  });
});
