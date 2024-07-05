import {
  AccountType,
  AssignmentState,
  Location,
  RequestState,
} from '@prisma/client';
import { Messages } from 'src/common/constants';
import {
  adminMockup,
  assignedUser,
  assignment,
  returningRequest,
} from './config/mock-data';
import { mockPrisma, service, setupTestModule } from './config/test-setup';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('returnRequest', () => {
    const assignment = {
      id: 1,
      state: AssignmentState.WAITING_FOR_ACCEPTANCE,
      assignedTo: {
        location: Location.DN,
      },
    };
    it('Should not return request if assignment is not found', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(service.requestReturn(adminMockup, 1)).rejects.toThrow(
        Messages.ASSIGNMENT.FAILED.ASSIGNMENT_NOT_FOUND,
      );
    });
    it('Should not return request if user is not in the same location', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        assignment,
      );

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignedUser,
        location: Location.DN,
      });

      await expect(service.requestReturn(adminMockup, 1)).rejects.toThrow(
        Messages.ASSIGNMENT.FAILED.USER_NOT_IN_SAME_LOCATION,
      );
    });

    it('Should not return request if user is staff and it not assigned to him', async () => {
      const user = {
        ...assignedUser,
        type: AccountType.STAFF,
        staffCode: 'ST0002',
      };

      const assignmentMock = {
        ...assignment,
        state: AssignmentState.ACCEPTED,
        assignedTo: {
          ...assignment.assignedTo,
          staffCode: 'ST0001',
          location: Location.HCM,
        },
      };

      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        assignmentMock,
      );

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(user);

      await expect(service.requestReturn(user, 1)).rejects.toThrow(
        Messages.ASSIGNMENT.FAILED.NOT_YOURS,
      );
    });

    it('Should not return request if assignment is not accepted', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        assignedTo: {
          ...assignment.assignedTo,
          location: Location.HCM,
        },
      });

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
        assignedUser,
      );

      await expect(service.requestReturn(adminMockup, 1)).rejects.toThrow(
        Messages.ASSIGNMENT.FAILED.NOT_ACCEPTED,
      );
    });

    it('Should return request', async () => {
      (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
        assignment,
      );

      (mockPrisma.account.findUnique as jest.Mock).mockResolvedValueOnce(
        assignedUser,
      );

      (mockPrisma.assignment.update as jest.Mock).mockResolvedValueOnce({
        ...assignment,
        returnRequest: true,
      });
    });
  });

  it('Should create return request and update assignment state', async () => {
    const acceptedAssignment = {
      ...assignment,
      state: AssignmentState.ACCEPTED,
      assignedTo: {
        ...assignment.assignedTo,
        id: adminMockup.id,
        location: Location.HCM,
        staffCode: adminMockup.staffCode,
      },
    };

    (mockPrisma.assignment.findUnique as jest.Mock).mockResolvedValueOnce(
      acceptedAssignment,
    );

    const createReturningRequestSpy = jest
      .spyOn(mockPrisma.returningRequest, 'create')
      .mockResolvedValueOnce(returningRequest);

    const updateAssignmentSpy = jest
      .spyOn(mockPrisma.assignment, 'update')
      .mockResolvedValueOnce({
        ...assignment,
        state: AssignmentState.IS_REQUESTED,
      });

    await expect(service.requestReturn(adminMockup, 1)).resolves.toEqual(
      returningRequest,
    );

    expect(createReturningRequestSpy).toHaveBeenCalledWith({
      data: {
        assignmentId: assignment.id,
        requestedById: adminMockup.id,
        acceptedById: null,
        returnedDate: null,
        state: RequestState.WAITING_FOR_RETURNING,
      },
    });

    expect(updateAssignmentSpy).toHaveBeenCalledWith({
      where: { id: assignment.id },
      data: { state: AssignmentState.IS_REQUESTED },
    });
  });
});
