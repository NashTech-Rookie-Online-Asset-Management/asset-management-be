import { validate } from 'class-validator';
import { IsValidName } from '../name-validate.decorator';
import { Messages } from 'src/common/constants';

class TestClass {
  @IsValidName()
  name: any;

  constructor(name: any) {
    this.name = name;
  }
}

describe('NameValidateDecorator', () => {
  it('Should return false if the name is not string', async () => {
    const test = new TestClass({});
    const errors = await validate(test);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isValidName).toBe(
      Messages.USER.FAILED.NAME_TOO_LONG_OR_CONTAIN_SPECIAL_CHARACTOR,
    );
  });

  it('should return true if the name is valid', async () => {
    const test = new TestClass('John Doe');
    const errors = await validate(test);
    expect(errors.length).toBe(0);
  });

  it('should return false if the name is empty', async () => {
    const test = new TestClass('');
    const errors = await validate(test);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isValidName).toBe(
      Messages.USER.FAILED.NAME_TOO_LONG_OR_CONTAIN_SPECIAL_CHARACTOR,
    );
  });

  it('should return false if the name is exceed 128 characters', async () => {
    const test = new TestClass('a'.repeat(129));
    const errors = await validate(test);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isValidName).toBe(
      Messages.USER.FAILED.NAME_TOO_LONG_OR_CONTAIN_SPECIAL_CHARACTOR,
    );
  });

  it('Should return false if the name contains special characters', async () => {
    const test = new TestClass('John Doe!');
    const errors = await validate(test);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isValidName).toBe(
      Messages.USER.FAILED.NAME_TOO_LONG_OR_CONTAIN_SPECIAL_CHARACTOR,
    );
  });
});
