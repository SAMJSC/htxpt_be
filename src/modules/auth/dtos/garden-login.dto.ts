import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
} from "class-validator";

export class GardenLoginDto {
    @IsString()
    @IsPhoneNumber()
    @IsOptional()
    phone: string;

    @IsString()
    @IsEmail()
    @IsOptional()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
