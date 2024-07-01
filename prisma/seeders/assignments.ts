/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import {
  Account,
  Asset,
  Assignment,
  AssignmentState,
  Prisma,
  PrismaClient,
} from '@prisma/client';
import seedConfig from '../seed-config';
const prisma = new PrismaClient();

type bindType = Pick<Prisma.AssignmentCreateInput, 'note' | 'state'>;

export function createRandomAssignment(): bindType {
  return {
    note: faker.commerce.productDescription(),
    state: faker.helpers.arrayElement([
      AssignmentState.ACCEPTED,
      AssignmentState.IS_REQUESTED,
      AssignmentState.WAITING_FOR_ACCEPTANCE,
    ]),
  };
}

export const ASSIGNMENTS: bindType[] = faker.helpers.multiple(
  createRandomAssignment,
  {
    count: seedConfig.assignment.count,
  },
);

export async function seedAssignments({
  assets,
  accounts,
}: {
  assets: Asset[];
  accounts: Account[];
}) {
  const assignments: Assignment[] = [];
  for (const [index, assignment] of ASSIGNMENTS.entries()) {
    const asset = faker.helpers.arrayElement(assets);
    const assignee = faker.helpers.arrayElement(accounts);
    const isAssetAssigned = assignments.some(
      (v) =>
        v.assetId === asset.id &&
        v.assignedToId === assignee.id &&
        asset.state === 'ASSIGNED',
    );
    if (isAssetAssigned) {
      continue;
    }
    const assigner = faker.helpers.arrayElement(accounts);
    const updatedAt = faker.date.past();
    const createdAt = faker.date.past({ refDate: updatedAt });
    const data: Prisma.AssignmentCreateInput = {
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
      createdAt,
      updatedAt,
    };
    const res = await prisma.assignment.create({
      data,
    });
    assignments.push(res);
  }
  return assignments;
}
