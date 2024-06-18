/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import {
  Account,
  Asset,
  Assignment,
  AssignmentState,
  Category,
  Location,
  Prisma,
  PrismaClient,
} from '@prisma/client';
const prisma = new PrismaClient();

type bindType = Pick<Prisma.AssignmentCreateInput, 'note' | 'state'>;

export function createRandomAssignment(): bindType {
  return {
    note: faker.commerce.productDescription(),
    state: faker.helpers.arrayElement([
      AssignmentState.ACCEPTED,
      AssignmentState.IS_REQUESTED,
      AssignmentState.WAITING_FOR_ACCEPTANCE,
      undefined,
    ]),
  };
}

export const ASSIGNMENTS: bindType[] = faker.helpers.multiple(
  createRandomAssignment,
  {
    count: {
      min: 20,
      max: 100,
    },
  },
);

export async function seedAssignments(assets: Asset[], accounts: Account[]) {
  const assignments: Assignment[] = [];
  for (const [index, assignment] of ASSIGNMENTS.entries()) {
    const asset = faker.helpers.arrayElement(assets);
    const assignee = faker.helpers.arrayElement(accounts);
    const assigner = faker.helpers.arrayElement(accounts);
    const res = await prisma.assignment.create({
      data: {
        ...assignment,
        asset: {
          connect: {
            id: asset.id,
          },
        },
        assignedTo: {
          connect: {
            id: assignee.id,
          },
        },
        assignedBy: {
          connect: {
            id: assigner.id,
          },
        },
      },
    });
    assignments.push(res);
  }
  return assignments;
}
