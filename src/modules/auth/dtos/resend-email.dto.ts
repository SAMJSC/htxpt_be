import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class ResendVerifyEmailDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;
}
