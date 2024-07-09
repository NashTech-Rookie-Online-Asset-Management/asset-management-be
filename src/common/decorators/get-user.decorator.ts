import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(handler);

export function handler(key: string | undefined, ctx: ExecutionContext) {
  const request = ctx.switchToHttp().getRequest();

  if (key) {
    return request.user[key];
  }

  return request.user;
}
