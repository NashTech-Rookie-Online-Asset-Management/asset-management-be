import { ReportPaginationDto } from '../../dto';
import {
  reportService,
  prismaService,
  setupTestModule,
} from './config/test-setup';
import { assets, report } from './config/mock-data';

describe('Report service', () => {
  beforeEach(async () => {
    await setupTestModule();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Should be defined', () => {
    expect(reportService).toBeDefined();
  });

  describe('Find all', () => {
    it('Should return an array of category groups', async () => {
      const dto: ReportPaginationDto = {
        skip: 0,
      };

      (prismaService.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(
        report.data,
      );

      (prismaService.asset.findMany as jest.Mock).mockResolvedValueOnce(assets);

      const res = await reportService.selectMany(dto);

      expect(res).toStrictEqual(report);
    });
  });
});
