import { plainToInstance } from 'class-transformer';
import { UpdateCategoryDto } from '../update-category.dto';

describe('UpdateCategoryDto', () => {
  it('Should trim name', () => {
    const dto = plainToInstance(UpdateCategoryDto, {
      name: '  My Category  ',
    });
    expect(dto.name).toBe('My Category');
  });
});
