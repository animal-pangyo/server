import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      // 'roles' 데코레이터가 설정되지 않은 경우, 접근을 허용합니다.
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRoles = request.user?.roles;

    if (!userRoles || !this.matchRoles(roles, userRoles)) {
      // 역할이 맞지 않거나, 사용자 인증이 되지 않은 경우 접근을 거부합니다.
      return false;
    }

    return true;
  }

  private matchRoles(allowedRoles: string[], userRoles: string[]): boolean {
    // 사용자 역할 중 어떤 역할이 허용된 역할과 일치하는지 확인합니다.
    return userRoles.some((role) => allowedRoles.includes(role));
  }
}
