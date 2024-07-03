import { AssignmentState, Location } from '@prisma/client';
import { Messages } from 'src/common/constants';
import { adminMockup, assignedUser, assignment } from './config/mock-data';
import { mockPrisma, service, setupTestModule } from './config/test-setup';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('responseAssignedAssignment', () => {
    const dto = { state: true };

    it('should throw Error if assignment is not found', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND);
    });
    it('Should throw BadRequest when user not same location', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        assignment,
      );

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignedUser,
        location: Location.DN,
      });

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION);
    });
    it('Should throw BadRequest when assignment is not waiting for acceptance', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.ACCEPTED,
        assignedTo: {
          ...assignment.assignedTo,
          location: Location.HCM,
        },
      });

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.NOT_WAITING_FOR_ACCEPTANCE);
    });

    it('Should throw BadRequest when assignment is not yours', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.WAITING_FOR_ACCEPTANCE,
        assignedTo: {
          ...assignment.assignedTo,
          location: Location.HCM,
        },
      });

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignedUser,
        location: Location.HCM,
      });

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).rejects.toThrow(Messages.ASSIGNMENT.FAILED.NOT_YOURS);
    });

    it('Should response assignment true', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.WAITING_FOR_ACCEPTANCE,
        assignedTo: {
          ...assignment.assignedTo,
          id: 1,
          location: Location.HCM,
          staffCode: adminMockup.staffCode,
        },
      });

      const updateSpy = jest
        .spyOn(mockPrisma.assignment, 'update')
        .mockResolvedValueOnce(null);

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, dto),
      ).resolves.toEqual({ message: Messages.ASSIGNMENT.SUCCESS.ACCEPTED });

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { state: AssignmentState.ACCEPTED },
      });
    });

    it('Should response assignment false', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.WAITING_FOR_ACCEPTANCE,
        assignedTo: {
          ...assignment.assignedTo,
          id: 1,
          location: Location.HCM,
          staffCode: adminMockup.staffCode,
        },
      });

      const updateSpy = jest
        .spyOn(mockPrisma.assignment, 'update')
        .mockResolvedValueOnce(null);

      await expect(
        service.responseAssignedAssignment(adminMockup, 1, { state: false }),
      ).resolves.toEqual({ message: Messages.ASSIGNMENT.SUCCESS.DECLINED });

      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { state: AssignmentState.DECLINED },
      });
    });
  });
});
