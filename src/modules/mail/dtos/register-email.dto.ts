import { USER_ROLES } from "@constants/common.constants";

export class RegisterEmailDto {
    email: string;
    username: string;
    token: string;
    role: USER_ROLES;
}
