import { validate } from 'class-validator';
import { IsOlderThan18, IsValidJoinedDate } from '../date-validate.decorator';
import { Messages } from 'src/common/constants';

class TestClass {
  @IsOlderThan18()
  dob: string;

  @IsValidJoinedDate()
  joinedDate: string;

  constructor(dob: string, joinedDate: string) {
    this.dob = dob;
    this.joinedDate = joinedDate;
  }
}

describe('DateValidateDecorator', () => {
  it('should return a valid class', async () => {
    const test = new TestClass('2000-01-01', '2020-01-01');
    const errors = await validate(test);
    expect(errors.length).toBe(0);
  });

  it('Should return an error if joined data is after dob', async () => {
    const test = new TestClass('2000-01-01', '1999-01-01');
    const errors = await validate(test);
    expect(errors[0].constraints.isValidJoinedDate).toBe(
      Messages.USER.FAILED.JOINED_AFTER_DOB,
    );
  });

  it('Should return an error when the birth date is less than 18 years', async () => {
    const test = new TestClass('2020-01-01', '2020-01-01');
    const errors = await validate(test);
    expect(errors[0].constraints.isOlderThan18).toBe(
      Messages.USER.FAILED.UNDER_AGE,
    );
  });

  it('Should return an error when the joined date is less than 18 years after the birth date', async () => {
    const test = new TestClass('2000-01-01', '2017-01-01');
    const errors = await validate(test);
    expect(errors[0].constraints.isValidJoinedDate).toBe(
      Messages.USER.FAILED.JOINED_DATE_UNDER_AGE,
    );
  });

  it('Should return an error when the joined date is on Saturday', async () => {
    const test = new TestClass('2000-01-01', '2020-01-04');
    const errors = await validate(test);
    expect(errors[0].constraints.isValidJoinedDate).toBe(
      Messages.USER.FAILED.JOINED_WEEKEND,
    );
  });

  it('Should return an error when the joined date is on Sunday', async () => {
    const test = new TestClass('2000-01-01', '2020-01-05');
    const errors = await validate(test);
    expect(errors[0].constraints.isValidJoinedDate).toBe(
      Messages.USER.FAILED.JOINED_WEEKEND,
    );
  });
});
