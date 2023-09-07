import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordEmailDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    @IsString()
    username: string;
    @IsNotEmpty()
    @IsString()
    token: string;
}
