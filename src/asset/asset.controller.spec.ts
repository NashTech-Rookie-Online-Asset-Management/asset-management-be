import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetPageOptions } from './dto';
import { Location, AssetState } from '@prisma/client';
import { RolesGuard } from 'src/common/guards/role.guard';

describe('AssetController', () => {
  let controller: AssetController;
  let service: AssetService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        {
          provide: AssetService,
          useValue: {
            getAssets: jest.fn(),
            getAsset: jest.fn(),
            create: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AssetController>(AssetController);
    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAssets', () => {
    it('should call assetService.getAssets with correct parameters', async () => {
      const location: Location = Location.HCM;
      const dto: AssetPageOptions = { page: 1, take: 10, skip: 0 };
      const result = {
        data: [
          {
            id: 1,
            name: 'Asset 1',
            assetCode: 'A00001',
            state: AssetState.AVAILABLE,
            category: {
              id: 1,
              name: 'Category 1',
            },
          },
        ],
        pagination: {
          totalPages: 1,
          totalCount: 1,
        },
      };

      jest.spyOn(service, 'getAssets').mockResolvedValue(result);

      expect(await controller.getAssets(location, dto)).toBe(result);
      expect(service.getAssets).toHaveBeenCalledWith(location, dto);
    });
  });

  describe('getAsset', () => {
    it('should call assetService.getAsset with correct parameters', async () => {
      const location: Location = Location.HCM;
      const id = 1;
      const result = {
        id: 1,
        name: 'Asset 1',
        assetCode: 'A00001',
        specification: 'Spec',
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
        location: Location.HCM,
        category: {
          id: 1,
          name: 'Category 1',
        },
        assignments: [],
      };

      jest.spyOn(service, 'getAsset').mockResolvedValue(result);

      expect(await controller.getAsset(location, id)).toBe(result);
      expect(service.getAsset).toHaveBeenCalledWith(location, id);
    });
  });

  describe('createAsset', () => {
    it('should call assetService.create with correct parameters', async () => {
      const location: Location = Location.HCM;
      const createAssetDto: CreateAssetDto = {
        name: 'Laptop HP Probook 450 G1',
        categoryId: 1,
        specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
        installedDate: new Date(),
        state: AssetState.AVAILABLE,
      };
      const result = {
        name: 'Laptop HP Probook 450 G1',
        assetCode: 'L00001',
        specification: 'Intel Core i5, 8GB RAM, 256GB SSD',
        state: AssetState.AVAILABLE,
        category: {
          name: 'Laptop',
          prefix: 'L',
        },
      };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.createAsset(location, createAssetDto)).toBe(
        result,
      );
      expect(service.create).toHaveBeenCalledWith(location, createAssetDto);
    });
  });
});
