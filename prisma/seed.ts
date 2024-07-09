/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { seedAccounts } from './seeders/accounts';
import { seedCategories } from './seeders/categories';
import { seedAssets } from './seeders/assets';
import { seedAssignments } from './seeders/assignments';
import { seedReturningRequests } from './seeders/returning-requests';
const prisma = new PrismaClient();

async function deleteAll() {
  const { count: deletedReturningRequests } =
    await prisma.returningRequest.deleteMany();
  const { count: deletedAssignments } = await prisma.assignment.deleteMany();
  const { count: deletedAccounts } = await prisma.account.deleteMany();
  const { count: deletedAssets } = await prisma.asset.deleteMany();

  console.log(`[DELETED] ${deletedReturningRequests} returning requests`);
  console.log(`[DELETED] ${deletedAssignments} assignments`);
  console.log(`[DELETED] ${deletedAccounts} accounts`);
  console.log(`[DELETED] ${deletedAssets} assets`);
}

async function main() {
  await deleteAll();
  const accounts = await seedAccounts();
  console.log(`[CREATED] ${accounts.length} accounts`);
  const categories = await seedCategories();
  console.log(`[CREATED] ${categories.length} categories`);
  const assets = await seedAssets({ categories });
  console.log(`[CREATED] ${assets.length} assets`);
  const assignments = await seedAssignments({ assets, accounts });
  console.log(`[CREATED] ${assignments.length} assignments`);
  const returningRequests = await seedReturningRequests({
    accounts,
    assignments,
  });
  console.log(`[CREATED] ${returningRequests.length} returning requests`);
}

main()
  .then(async () => {
    console.log('__Done!__');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
