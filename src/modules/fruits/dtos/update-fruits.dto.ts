import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateFruitsDto {
    @IsOptional()
    @IsString()
    readonly fruit_name: string;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    @IsString()
    readonly fruit_category_name: string;

    @IsOptional()
    readonly range_price: number[];

    @IsOptional()
    readonly shape: string[];

    @IsOptional()
    readonly dimeter: number[];

    @IsOptional()
    readonly weight: number[];
}
