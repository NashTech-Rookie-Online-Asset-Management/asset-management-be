import { plainToInstance } from 'class-transformer';
import { MAX_PAGE_SIZE, Order } from '../constants';
import { PaginationDto } from './pagination.dto';

describe('PaginationDto', () => {
  it('Should create a new instance of PaginationDto', () => {
    expect(new PaginationDto()).toBeInstanceOf(PaginationDto);
  });

  it('Should have all the default properties', () => {
    const dto = new PaginationDto();
    expect(dto.page).toBe(1);
    expect(dto.take).toBe(MAX_PAGE_SIZE);
    expect(dto.skip).toBe(0);
    expect(dto.search).toBe('');
    expect(dto.sortOrder).toBe(Order.ASC);
  });

  it('Should trim the search string', () => {
    const dto = plainToInstance(PaginationDto, { search: ' test ' });
    expect(dto.search).toBe('test');
  });

  it('Should return the correct skip value', () => {
    const dto = plainToInstance(PaginationDto, { page: 2, take: 10 });
    expect(dto.skip).toBe(10);
  });

  it('Should return 0 for skip if take is 0', () => {
    const dto = plainToInstance(PaginationDto, { page: 2, take: 0 });
    expect(dto.skip).toBe(0);
  });
});
