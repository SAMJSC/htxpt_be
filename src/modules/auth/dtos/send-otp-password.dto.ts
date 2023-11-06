import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsPhoneNumber } from "class-validator";

export class SendOtpForgotPasswordDto {
    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email: string;

    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone: string;
}
