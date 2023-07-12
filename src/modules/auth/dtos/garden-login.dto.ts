import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class GardenLoginDto {
    @IsString()
    @IsPhoneNumber()
    phone: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
