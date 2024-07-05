import {
  controller,
  reportService,
  expressResponse,
  setupTestController,
} from './config/test-setup';
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
      const mockBuffer = Buffer.from('mocked file content');

      jest.spyOn(reportService, 'export').mockResolvedValue(mockBuffer);

      await controller.getReportFile(FileFormat.EXCEL, expressResponse);

      expect(reportService.export).toHaveBeenCalledWith(FileFormat.EXCEL);
      // expect(expressResponse.setHeader).toHaveBeenCalledWith(
      //   'Content-Disposition',
      //   expect.stringContaining('attachment; filename=OAM Report '),
      // );
      // expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });
  });
});
