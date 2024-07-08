import {
  prismaService,
  reportService,
  setupTestModule,
} from './config/test-setup';
import { assets, report } from './config/mock-data';
import { FileFormat } from 'src/common/constants/file-format';
import { Location } from '@prisma/client';

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

  describe('Create file', () => {
    it('Should return a file buffer', async () => {
      (prismaService.$queryRawUnsafe as jest.Mock).mockResolvedValueOnce(
        report.data,
      );

      (prismaService.asset.findMany as jest.Mock).mockResolvedValueOnce(assets);

      const res = await reportService.export(FileFormat.EXCEL, Location.HCM);

      expect(res).toBeInstanceOf(Buffer);
    });
  });
});
