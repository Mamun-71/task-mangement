import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
// import { PERMISSION_KEY } from "../common/utils/meta.data";

export const PERMISSION_KEY = 'permissions';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasPermissionKeys = this.reflector.get<string[]>(PERMISSION_KEY, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const authUser = request.user; // populated by JwtAuthGuard

    if (!authUser?.id && !authUser?._id) {
      throw new UnauthorizedException("Unauthenticated Action. Login Required!");
    }

    if (!hasPermissionKeys) {
      return true;
    }

    const authUserPermissions = authUser.role?.permissions?.map((p: any) => p.name || p) ?? [];

    console.log(authUserPermissions);

    // check if one of permissionKeys array element exist in authUser permission array
    return hasPermissionKeys.some((permissionKey) => authUserPermissions.includes(permissionKey));
  }
}
