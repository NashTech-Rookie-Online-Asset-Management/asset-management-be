import { Test, TestingModule } from '@nestjs/testing';
import { FileService } from 'src/file/file.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportService } from 'src/report/report.service';

export let reportService: ReportService;
export let prismaService: PrismaService;
export let fileService: FileService;

export const setupTestModule = async () => {
  prismaService = {
    $queryRawUnsafe: jest.fn(),
    asset: {
      findMany: jest.fn(),
    },
  } as any;

  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ReportService,
      {
        provide: PrismaService,
        useValue: prismaService,
      },
      FileService,
    ],
  }).compile();

  reportService = module.get<ReportService>(ReportService);
};
