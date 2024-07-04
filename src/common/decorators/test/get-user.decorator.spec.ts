import { ExecutionContext } from '@nestjs/common';
import { handler } from '../get-user.decorator';

const mockUser = {
  id: 1,
  email: 'test@email.com',
};

const mockCtx = {
  switchToHttp: () => ({
    getRequest: () => ({ user: mockUser }),
  }),
} as unknown as ExecutionContext;

describe('GetUserDecorator', () => {
  it('should return the user object', () => {
    const user = handler(undefined, mockCtx);
    expect(user).toEqual(mockUser);
  });

  it('should return the user property', () => {
    const user = handler('email', mockCtx);
    expect(user).toEqual(mockUser.email);
  });
});
