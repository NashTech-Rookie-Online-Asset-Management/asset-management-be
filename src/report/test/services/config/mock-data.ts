import { Asset } from '@prisma/client';

export const assets: Partial<Asset>[] = [
  {
    id: 1,
    categoryId: 1,
  },
];
export const report = {
  data: [
    {
      categoryName: 'Laptop',
      total: 0,
      assigned: 0,
      available: 0,
      notAvailable: 0,
      waitingForRecycling: 0,
      recycled: 0,
    },
  ],
  pagination: {
    totalPages: 1,
    totalCount: 1,
  },
};
