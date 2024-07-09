import { plainToInstance } from 'class-transformer';
import { CreateCategoryDto } from '../create-category.dto';

describe('CreateCategoryDto', () => {
  it('Should trim name', () => {
    const dto = plainToInstance(CreateCategoryDto, {
      name: '  My Category  ',
    });
    expect(dto.name).toBe('My Category');
  });
});
