import { ReportPaginationDto } from 'src/report/dto';
import { reportService, setupTestController } from './config/test-setup';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('getReport', () => {
    it('should call reportService.getReport with correct parameters', async () => {
      const dto: ReportPaginationDto = {
        skip: 0,
      };
      jest.spyOn(reportService, 'selectMany').mockResolvedValue({
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
          totalPages: 0,
          totalCount: 0,
        },
      });

      await reportService.selectMany(dto);

      expect(reportService.selectMany).toHaveBeenCalledWith(dto);
    });
  });
});
