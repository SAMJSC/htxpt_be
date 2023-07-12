import { USER_ROLES } from "@constants/common.constants";
import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "role";
export const Roles = (...roles: USER_ROLES[]) => SetMetadata(ROLES_KEY, roles);
