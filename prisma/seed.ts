/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { seedAccounts } from './seeders/accounts';
import { seedCategories } from './seeders/categories';
import { seedAssets } from './seeders/assets';
import { seedAssignments } from './seeders/assignments';
import { seedReturningRequests } from './seeders/returning-requests';
const prisma = new PrismaClient();

async function deleteAll() {
  await prisma.returningRequest.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.asset.deleteMany();
}

async function main() {
  await deleteAll();
  const accounts = await seedAccounts();
  const categories = await seedCategories();
  const assets = await seedAssets({ categories });
  const assignments = await seedAssignments({ assets, accounts });
  const returningRequests = await seedReturningRequests({
    accounts,
    assignments,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
