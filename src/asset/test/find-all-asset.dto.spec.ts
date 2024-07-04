import { plainToInstance } from 'class-transformer';
import { AssetPageOptions } from '../dto';
import { AssetState } from '@prisma/client';

describe('FindAllAssetDto', () => {
  it('Should trasform states to array of AssetState', () => {
    const dto = plainToInstance(AssetPageOptions, {
      states: `${AssetState.ASSIGNED},${AssetState.AVAILABLE},${AssetState.NOT_AVAILABLE}`,
    });

    expect(dto.states).toEqual([
      AssetState.ASSIGNED,
      AssetState.AVAILABLE,
      AssetState.NOT_AVAILABLE,
    ]);
  });

  it('Should transform categoryIds to array of number', () => {
    const dto = plainToInstance(AssetPageOptions, {
      categoryIds: '1,2,3',
    });

    expect(dto.categoryIds).toEqual([1, 2, 3]);
  });
});
