import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../create-user.dto';

describe('CreateUserDto', () => {
  it('Should trim user first name and lastname', () => {
    const dto = plainToInstance(CreateUserDto, {
      firstName: '  John  ',
      lastName: '  Doe  ',
    });
    expect(dto.firstName).toBe('John');
    expect(dto.lastName).toBe('Doe');
  });
});
