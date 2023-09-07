import { USER_ROLES } from "@constants/common.constants";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class RegisterEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @IsString()
    username: string;

    @IsNotEmpty()
    @IsString()
    token: string;

    @IsNotEmpty()
    role: USER_ROLES;
}
