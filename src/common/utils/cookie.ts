import { CookieOptions } from 'express';

export function getCookieOptions(env?: string): CookieOptions {
  return env === 'production'
    ? {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      }
    : {
        httpOnly: true,
      };
}
