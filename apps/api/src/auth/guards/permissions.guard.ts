import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { hasPermission } from '@bturbovets/auth';
import { Permission } from '@bturbovets/data';
import { PERMISSIONS_KEY } from '@bturbovets/auth';
import { User } from '../../entities/user.entity';
import { Role } from '@bturbovets/data';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;
    if (!user) return false;

    const role = user.role as Role;
    return required.every((p) => hasPermission(role, p));
  }
}
