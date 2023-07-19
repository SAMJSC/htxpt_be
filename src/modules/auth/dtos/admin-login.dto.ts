import { IsNotEmpty, IsString } from "class-validator";

export class AdminLoginDto {
    @IsString()
    @IsNotEmpty()
    user_name: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}
