import { UserRoles } from "@constants/common.constants";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "role";
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
