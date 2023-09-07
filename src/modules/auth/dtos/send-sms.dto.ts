import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsPhoneNumber } from "class-validator";

export class SendSmsDto {
    @ApiProperty()
    @IsPhoneNumber()
    @IsOptional()
    phone: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email: string;
}
