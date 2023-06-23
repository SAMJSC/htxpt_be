// import { UserRoles } from "@constants/common.constants";
// import type { CanActivate, ExecutionContext } from "@nestjs/common";
// import { Injectable } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";
// import _ from "lodash";
// import {User} from "schemas/users.schema";

// @Injectable()
// export class RolesGuard implements CanActivate {
//     constructor(private readonly reflector: Reflector) {}

//     canActivate(context: ExecutionContext): boolean {
//         const roles = this.reflector.get<UserRoles[]>(
//             "roles",
//             context.getHandler()
//         );

//         if (_.isEmpty(roles)) {
//             return true;
//         }

//         const request = context.switchToHttp().getRequest();
//         const user = <UserEntity>request.user;

//         return roles.includes(user.role);
//     }
// }
