import { Location } from '@prisma/client';
import { AssetPaginationDto } from 'src/assignment/assignment.dto';
import { mockPrisma, service, setupTestModule } from './config/test-setup';
import { createdUser } from './config/mock-data';

describe('Assignment Service', () => {
  beforeAll(async () => {
    await setupTestModule();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('Should list all available assets', async () => {
    const mockValue = [
      { id: 1, name: 'Laptop', location: Location.HCM },
      { id: 2, name: 'Monitor', location: Location.HCM },
    ];

    (mockPrisma.asset.findMany as jest.Mock).mockResolvedValueOnce(mockValue);
    (mockPrisma.asset.count as jest.Mock).mockResolvedValueOnce(2);

    const result = await service.getAvailableAsset(
      createdUser,
      new AssetPaginationDto(),
    );
    expect(result).toEqual({
      pagination: {
        totalCount: 2,
        totalPages: 1,
      },
      data: mockValue,
    });
  });
});
