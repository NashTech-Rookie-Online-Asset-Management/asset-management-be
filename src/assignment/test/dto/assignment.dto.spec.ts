import { AssignmentState } from '@prisma/client';
import { plainToInstance } from 'class-transformer';
import { AssignmentPaginationDto } from 'src/assignment/assignment.dto';

describe('AssignmentDto', () => {
  it('Should split states', () => {
    const dto = plainToInstance(AssignmentPaginationDto, {
      states: `${AssignmentState.ACCEPTED},${AssignmentState.DECLINED}`,
    });
    expect(dto.states).toEqual([
      AssignmentState.ACCEPTED,
      AssignmentState.DECLINED,
    ]);
  });
});
