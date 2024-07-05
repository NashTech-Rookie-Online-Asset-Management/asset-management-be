import { ReportPaginationDto } from 'src/report/dto';
import {
  controller,
  reportService,
  setupTestController,
} from './config/test-setup';

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
      const result = {
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
      };
      jest.spyOn(reportService, 'selectMany').mockResolvedValue(result);

      const res = await controller.getReport(dto);

      expect(res).toBe(result);
      expect(reportService.selectMany).toHaveBeenCalledWith(dto);
    });
  });
});
