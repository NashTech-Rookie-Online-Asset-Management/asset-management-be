import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReportService } from './report.service';
import { ReportPaginationDto } from './dto';

const mockPrismaService = {
  $queryRawUnsafe: jest.fn(),
  asset: {
    findMany: jest.fn(),
  },
};

describe('Report service', () => {
  let service: ReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
  });

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Find all', () => {
    it('Should return an array of category groups', async () => {
      const dto: ReportPaginationDto = {
        skip: 0,
      };
      const categories = [
        {
          categoryName: 'Laptop',
          total: 0,
          assigned: 0,
          available: 0,
          notAvailable: 0,
          waitingForRecycling: 0,
          recycled: 0,
        },
      ];
      const assets = [
        {
          id: 1,
          categoryId: 1,
        },
      ];

      (mockPrismaService.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(
        categories,
      );

      (mockPrismaService.asset.findMany as jest.Mock).mockResolvedValueOnce(
        assets,
      );

      await service.selectMany(dto);

      expect(mockPrismaService.asset.findMany).toHaveBeenCalledWith({
        distinct: ['categoryId'],
      });
    });
  });
});
