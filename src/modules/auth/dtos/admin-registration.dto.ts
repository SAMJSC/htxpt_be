import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class AdminRegistrationDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    user_name: string;

    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @IsNotEmpty()
    confirm_password: string;
}
