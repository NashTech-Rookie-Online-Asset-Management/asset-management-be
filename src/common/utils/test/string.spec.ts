import { formatFirstName } from '../string';

describe('String', () => {
  it('Should return true if string is empty', () => {
    expect(formatFirstName('')).toBe('');
  });

  it('Should format name', () => {
    expect(formatFirstName('John Doe')).toBe('johnd');
  });
});
