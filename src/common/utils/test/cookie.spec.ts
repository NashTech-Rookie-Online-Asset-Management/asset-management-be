import { getCookieOptions } from '../cookie';

describe('CookieOptions', () => {
  it('Should return cookie options for production', () => {
    const cookieOptions = getCookieOptions('production');
    expect(cookieOptions).toEqual({
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
  });

  it('Should return cookie options for development', () => {
    const cookieOptions = getCookieOptions('development');
    expect(cookieOptions).toEqual({
      httpOnly: true,
    });
  });

  it('Should return default cookie options', () => {
    const cookieOptions = getCookieOptions();
    expect(cookieOptions).toEqual({
      httpOnly: true,
    });
  });
});
