import { ReportPaginationDto } from '../dto';

describe('FindAllReportItem', () => {
  it('Should be defined', () => {
    const dto = new ReportPaginationDto();
    expect(dto).toBeDefined();
  });
});
