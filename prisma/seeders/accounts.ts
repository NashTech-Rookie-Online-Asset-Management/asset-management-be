/* eslint-disable @typescript-eslint/no-unused-vars */
import { faker } from '@faker-js/faker';
import {
  Account,
  AccountType,
  Gender,
  Location,
  Prisma,
  PrismaClient,
  UserStatus,
} from '@prisma/client';
import { seedConfig } from '../seed-config';

const prisma = new PrismaClient();

export function createRandomAccount(): Prisma.AccountCreateInput {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const fullName = `${firstName} ${lastName}`;
  const username =
    firstName.toLowerCase() +
    lastName
      .split(' ')
      .map((v) => v[0])
      .join('')
      .toLowerCase();

  return {
    firstName,
    lastName,
    fullName,
    username,
    staffCode: `${seedConfig.account.staffCodePrefix}${faker.string.numeric({
      length: 4,
      allowLeadingZeros: true,
    })}`,
    status: faker.helpers.enumValue(UserStatus),
    gender: faker.helpers.enumValue(Gender),
    dob: faker.date.birthdate(),
    password: seedConfig.account.password,
    location: faker.helpers.enumValue(Location),
    joinedAt: faker.date.past(),
    type: faker.helpers.arrayElement(
      Object.values(AccountType).filter((v) => v !== 'ROOT'),
    ),
  };
}

export const ACCOUNTS: Prisma.AccountCreateInput[] = faker.helpers.multiple(
  createRandomAccount,
  {
    count: seedConfig.account.count,
  },
);

export async function seedAccounts() {
  const accounts: Account[] = [];

  const rootUser = createRandomAccount();
  rootUser.type = 'ROOT';
  rootUser.username = 'root';
  rootUser.status = 'ACTIVE';
  rootUser.location = 'HCM';
  await prisma.account.create({ data: rootUser });

  const adminUser = createRandomAccount();
  adminUser.type = 'ADMIN';
  adminUser.username = 'admin';
  adminUser.status = 'ACTIVE';
  adminUser.location = 'HCM';
  const res0 = await prisma.account.create({ data: adminUser });
  accounts.push(res0);

  const staffUser = createRandomAccount();
  staffUser.type = 'STAFF';
  staffUser.username = 'staff';
  staffUser.status = 'ACTIVE';
  staffUser.location = 'HCM';
  const res1 = await prisma.account.create({ data: staffUser });
  accounts.push(res1);

  for (const [index, account] of ACCOUNTS.entries()) {
    const res = await prisma.account.create({ data: account });
    accounts.push(res);
  }

  return accounts;
}
