/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import {
  Account,
  Assignment,
  Prisma,
  PrismaClient,
  RequestState,
  ReturningRequest,
} from '@prisma/client';
const prisma = new PrismaClient();

export function createRandomReturningRequest(
  assignmentId: number,
  requestedById: number,
): Prisma.ReturningRequestCreateInput {
  const state = faker.helpers.arrayElement([
    RequestState.COMPLETED,
    RequestState.WAITING_FOR_RETURNING,
  ]);

  const returnedDate = state === RequestState.COMPLETED ? new Date() : null;

  return {
    state,
    returnedDate,
    requestedBy: {
      connect: {
        id: requestedById,
      },
    },
    assignment: {
      connect: {
        id: assignmentId,
      },
    },
  };
}

export async function seedReturningRequests({
  accounts,
  assignments,
}: {
  accounts: Account[];
  assignments: Assignment[];
}) {
  const returningRequests: ReturningRequest[] = [];
  for (const [index, assignment] of assignments.entries()) {
    const isMakeRequest = faker.datatype.boolean();
    if (!isMakeRequest) {
      continue;
    }
    const admins = accounts.filter((v) => v.type === 'ADMIN');
    const requestedById = faker.helpers.arrayElement([
      assignment.assignedToId,
      faker.helpers.arrayElement(admins).id,
    ]);

    const data: Prisma.ReturningRequestCreateInput =
      createRandomReturningRequest(assignment.id, requestedById);

    if (data.state === RequestState.COMPLETED) {
      data.acceptedBy = {
        connect: {
          id: faker.helpers.arrayElement(admins).id,
        },
      };
    }

    const res = await prisma.returningRequest.create({
      data,
    });
    returningRequests.push(res);
  }

  return returningRequests;
}
