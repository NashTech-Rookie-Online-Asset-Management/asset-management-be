import { reportService, setupTestController } from './config/test-setup';
import { FileFormat } from 'src/common/constants/file-format';

describe('AssetController', () => {
  beforeEach(async () => {
    await setupTestController();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('exportReport', () => {
    it('should call reportService.export with correct parameters', async () => {
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

      await reportService.export(FileFormat.EXCEL);

      expect(reportService.export).toHaveBeenCalledWith(FileFormat.EXCEL);
    });
  });
});
