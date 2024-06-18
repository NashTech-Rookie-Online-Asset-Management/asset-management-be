/* eslint-disable @typescript-eslint/no-unused-vars */
import { Category, PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const CATEGORIES: { name: string; prefix: string }[] = [
  { name: 'Laptop', prefix: 'LP' },
  { name: 'Monitor', prefix: 'MO' },
  { name: 'Keyboard', prefix: 'KB' },
  { name: 'Mouse', prefix: 'MS' },
  { name: 'Personal Computer', prefix: 'PC' },
];

export async function seedCategories() {
  const categories: Category[] = [];
  for (const [index, category] of CATEGORIES.entries()) {
    const res = await prisma.category.upsert({
      where: {
        prefix: category.prefix,
      },
      create: {
        ...category,
      },
      update: {},
    });
    categories.push(res);
  }
  return categories;
}
