import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator(handler);

export function handler(data: unknown, ctx: ExecutionContext) {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
}
