import { IsEmail, IsNotEmpty, IsNumber } from "class-validator";

export class SendVerifyOtpDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsNumber()
    otp: number;
}
