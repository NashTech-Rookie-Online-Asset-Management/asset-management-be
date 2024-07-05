import { plainToInstance } from 'class-transformer';
import { UserPaginationDto } from '../find-all-users.dto';
import { AccountType } from '@prisma/client';

describe('FindAllUserDto', () => {
  it('Should trim and split types', () => {
    const dto = plainToInstance(UserPaginationDto, {
      types: `  ${AccountType.ADMIN},${AccountType.STAFF}  `,
    });
    expect(dto.types).toEqual([AccountType.ADMIN, AccountType.STAFF]);
  });
});
