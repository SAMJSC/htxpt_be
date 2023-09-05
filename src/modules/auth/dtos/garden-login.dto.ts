import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class GardenLoginDto {
    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
