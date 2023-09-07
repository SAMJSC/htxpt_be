import { ApiProperty } from "@nestjs/swagger";
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";

export class VerifyOtpDto {
    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    otp: string;
}
