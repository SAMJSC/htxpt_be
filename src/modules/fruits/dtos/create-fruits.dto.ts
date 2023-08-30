import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateFruitsDto {
    @IsNotEmpty()
    @IsString()
    readonly fruit_name: string;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsNotEmpty()
    @IsString()
    readonly fruit_category_name: string;

    @IsNotEmpty()
    readonly range_price: number[];

    @IsNotEmpty()
    readonly shape: string[];

    @IsNotEmpty()
    readonly dimeter: number[];

    @IsNotEmpty()
    readonly weight: number[];
}
