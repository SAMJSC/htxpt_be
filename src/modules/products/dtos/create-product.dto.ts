import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsEmail()
    readonly name: string;

    @IsNotEmpty()
    @IsString()
    readonly type: string;
}
