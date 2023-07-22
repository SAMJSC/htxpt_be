import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class CustomerLoginDto {
    @IsString()
    @IsPhoneNumber()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
