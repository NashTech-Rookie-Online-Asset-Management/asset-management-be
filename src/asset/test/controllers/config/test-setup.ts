import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from 'src/asset/asset.controller';
import { AssetService } from 'src/asset/asset.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { ReportService } from 'src/report/report.service';

export let controller: AssetController;
export let service: AssetService;
export let reportService: ReportService;
export const mockAssetService = {
  getAssets: jest.fn(),
  getAsset: jest.fn(),
  update: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
};
export const mockReportService = {
  selectMany: jest.fn(),
};
export const setupTestController = async () => {
  const module: TestingModule = await Test.createTestingModule({
    controllers: [AssetController],
    providers: [
      { provide: AssetService, useValue: mockAssetService },

      { provide: ReportService, useValue: mockReportService },
    ],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

  controller = module.get<AssetController>(AssetController);
  service = module.get<AssetService>(AssetService);
  reportService = module.get<ReportService>(ReportService);
};
