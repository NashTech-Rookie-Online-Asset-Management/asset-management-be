import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AccountType, UserStatus } from '@prisma/client';
import { ROLES_KEY } from '../decorators/role.decorator';
import { Messages } from '../constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<AccountType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(Messages.AUTH.FAILED.INACTIVE);
    }

    const hasRole = requiredRoles.some((role) => user.type?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException(Messages.AUTH.FAILED.DO_NOT_HAVE_PERMISSION);
    }

    return true;
  }
}
