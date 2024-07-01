import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import { ReportItem, ReportPaginationDto } from './dto';

@Injectable()
export class ReportService {
  constructor(private readonly prismaService: PrismaService) {}

  async selectMany(queryParams: ReportPaginationDto) {
    const raw = (await this.prismaService.$queryRawUnsafe(`
      SELECT
        c."name" as "categoryName",
        SUM(1) AS "total",
        SUM(CASE WHEN a."state" = 'ASSIGNED' THEN 1 ELSE 0 END) AS "assigned",
        SUM(CASE WHEN a."state" = 'AVAILABLE' THEN 1 ELSE 0 END) AS "available",
        SUM(CASE WHEN a."state" = 'NOT_AVAILABLE' THEN 1 ELSE 0 END) AS "notAvailable",
        SUM(CASE WHEN a."state" = 'WAITING_FOR_RECYCLING' THEN 1 ELSE 0 END) AS "waitingForRecycling",
        SUM(CASE WHEN a."state" = 'RECYCLED' THEN 1 ELSE 0 END) AS "recycled"
      FROM public."Asset" a
      JOIN public."Category" c ON a."categoryId" = c."id"
      WHERE c."name" LIKE '%${queryParams.search}%'
      GROUP BY c."name"
      ORDER BY "${queryParams.sortField}" ${queryParams.sortOrder}
      LIMIT ${queryParams.take ?? 'ALL'} 
      OFFSET ${queryParams.skip}`)) as ReportItem[];

    const res = raw.map((e) => {
      const item: ReportItem = {
        categoryName: e.categoryName,
        total: Number(e.total),
        assigned: Number(e.assigned),
        available: Number(e.available),
        notAvailable: Number(e.notAvailable),
        waitingForRecycling: Number(e.waitingForRecycling),
        recycled: Number(e.recycled),
      };
      return item;
    });

    const totalCount = (
      await this.prismaService.asset.findMany({
        distinct: ['categoryId'],
      })
    ).length;

    return {
      data: res,
      pagination: {
        totalPages: queryParams.take
          ? Math.ceil(totalCount / queryParams.take)
          : 1,
        totalCount,
      },
    };
  }
}
