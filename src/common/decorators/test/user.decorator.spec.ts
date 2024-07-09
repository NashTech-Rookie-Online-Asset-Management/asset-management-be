import { ExecutionContext } from '@nestjs/common';
import { handler } from '../user.decorator';

const mockUser = {
  id: 1,
  email: 'test@email.com',
};

const mockCtx = {
  switchToHttp: () => ({
    getRequest: () => ({ user: mockUser }),
  }),
} as unknown as ExecutionContext;

describe('UserDecorator', () => {
  it('should return the user object', () => {
    const user = handler(undefined, mockCtx);
    expect(user).toEqual(mockUser);
  });
});
