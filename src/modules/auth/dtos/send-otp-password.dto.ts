import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SendOtpForgotPasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    email: string;
}
