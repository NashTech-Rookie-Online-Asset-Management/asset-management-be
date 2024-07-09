import { Location } from '@prisma/client';
import {
  AssetPaginationDto,
  AssetSortKey,
} from 'src/assignment/assignment.dto';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import { createdUser } from './config/mock-data';
import { plainToInstance } from 'class-transformer';

const mockValue = [
  { id: 1, name: 'Laptop', location: Location.HCM },
  { id: 2, name: 'Monitor', location: Location.HCM },
];

const mockResult = {
  data: mockValue,
  pagination: { totalCount: 2, totalPages: 1 },
};

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });

  beforeEach(() => {
    (mockPrisma.asset.findMany as jest.Mock).mockResolvedValueOnce(mockValue);
    (mockPrisma.asset.count as jest.Mock).mockResolvedValueOnce(2);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should get available assets with default pagination', async () => {
    const result = await service.getAvailableAsset(
      createdUser,
      new AssetPaginationDto(),
    );
    expect(result).toEqual(mockResult);
  });

  it('Should get available assets with asset category sort key', async () => {
    const dto = plainToInstance(AssetPaginationDto, {
      sortField: AssetSortKey.ASSET_CATEGORY,
    });
    const result = await service.getAvailableAsset(createdUser, dto);
    expect(result).toEqual(mockResult);
  });
});
