/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { seedAccounts } from './seeders/account';
import { seedCategories } from './seeders/categories';
import { seedAssets } from './seeders/assets';
import { seedAssignments } from './seeders/assignments';
const prisma = new PrismaClient();

async function deleteAll() {
  await prisma.assignment.deleteMany();
  await prisma.account.deleteMany();
  await prisma.asset.deleteMany();
}

async function main() {
  await deleteAll();
  const accounts = await seedAccounts();
  const categories = await seedCategories();
  const assets = await seedAssets(categories);
  const assignments = await seedAssignments(assets, accounts);
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
