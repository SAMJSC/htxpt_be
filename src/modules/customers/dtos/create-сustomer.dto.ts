import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateCustomerDto {
    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    readonly password: string;
}
