/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Account,
  AccountType,
  Gender,
  Location,
  Prisma,
  UserStatus,
} from '@prisma/client';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
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
    type: faker.helpers.enumValue(AccountType),
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
  for (const [index, account] of ACCOUNTS.entries()) {
    const res = await prisma.account.create({ data: account });
    accounts.push(res);
  }
  return accounts;
}
