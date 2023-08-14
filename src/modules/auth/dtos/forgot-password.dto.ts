import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    confirmPassword: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    otp: string;
}
