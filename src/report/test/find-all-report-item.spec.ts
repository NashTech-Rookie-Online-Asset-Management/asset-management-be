import { plainToInstance } from 'class-transformer';
import { FindAllReportItemsSortKey, ReportPaginationDto } from '../dto';
import { validate } from 'class-validator';
import { MAX_PAGE_SIZE } from 'src/common/constants';

describe('FindAllReportItem', () => {
  it('Should be defined', () => {
    const dto = new ReportPaginationDto();
    expect(dto).toBeDefined();
  });

  it('should transform and validate take property correctly', async () => {
    const plainDto = { take: '5' };
    const dto = plainToInstance(ReportPaginationDto, plainDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.take).toBe(5);
  });

  it('should fail validation if take is less than 1', async () => {
    const plainDto = { take: 0 };
    const dto = plainToInstance(ReportPaginationDto, plainDto);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.min).toBeDefined();
  });

  it('should fail validation if take is more than MAX_PAGE_SIZE', async () => {
    const plainDto = { take: MAX_PAGE_SIZE + 1 };
    const dto = plainToInstance(ReportPaginationDto, plainDto);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.max).toBeDefined();
  });

  it('should use default sortField value if not provided', async () => {
    const dto = new ReportPaginationDto();
    expect(dto.sortField).toBe(FindAllReportItemsSortKey.CATEGORY);
  });

  it('should validate sortField with valid enum value', async () => {
    const plainDto = { sortField: FindAllReportItemsSortKey.AVAILABLE };
    const dto = plainToInstance(ReportPaginationDto, plainDto);
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.sortField).toBe(FindAllReportItemsSortKey.AVAILABLE);
  });

  it('should fail validation with invalid enum value for sortField', async () => {
    const plainDto = { sortField: 'invalid' };
    const dto = plainToInstance(ReportPaginationDto, plainDto);
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isEnum).toBeDefined();
  });
});
