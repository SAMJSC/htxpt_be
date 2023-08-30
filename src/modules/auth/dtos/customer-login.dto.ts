import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CustomerLoginDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
