import { plainToInstance } from 'class-transformer';
import { ReturningRequestPageOptions } from './find-all-returning-requests.dto';
import { RequestState } from '@prisma/client';

describe('FindAllRequtingRequestsDto', () => {
  it('Should trim and split states', () => {
    const dto = plainToInstance(ReturningRequestPageOptions, {
      states: `  ${RequestState.COMPLETED},${RequestState.WAITING_FOR_RETURNING}  `,
    });
    expect(dto.states).toEqual([
      RequestState.COMPLETED,
      RequestState.WAITING_FOR_RETURNING,
    ]);
  });
});
