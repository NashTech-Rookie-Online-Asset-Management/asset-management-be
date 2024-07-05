import { formatDate, isOlderThan18 } from '../date';

describe('Date', () => {
  it('Should format date if input is string', () => {
    const date = formatDate('2021-01-01');
    expect(date).toBe('01012021');
  });

  it('Should format date if input is Date object', () => {
    const date = formatDate(new Date('2021-01-01'));
    expect(date).toBe('01012021');
  });

  it('should return true for a person who is exactly 18 years old today', () => {
    const today = new Date();
    const dob = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate(),
    );
    expect(isOlderThan18(dob)).toBe(true);
  });

  it('should return false for a person who is just below 18 years old', () => {
    const today = new Date();
    const dob = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate() + 1,
    );
    expect(isOlderThan18(dob)).toBe(false);
  });

  it('should return true for a person who is above 18 years old', () => {
    const today = new Date();
    const dob = new Date(
      today.getFullYear() - 19,
      today.getMonth(),
      today.getDate(),
    );
    expect(isOlderThan18(dob)).toBe(true);
  });

  it('should return true for a person who is just above 18 years old', () => {
    const today = new Date();
    const dob = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate() - 1,
    );
    expect(isOlderThan18(dob)).toBe(true);
  });

  it('should return false for a person who is below 18 years old by one day', () => {
    const today = new Date();
    const dob = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate() + 1,
    );
    expect(isOlderThan18(dob)).toBe(false);
  });
});
