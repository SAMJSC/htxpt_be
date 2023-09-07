import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";

export class ForgotPasswordDto {
    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone: string;

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
