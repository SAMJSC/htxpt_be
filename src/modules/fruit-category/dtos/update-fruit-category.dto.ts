import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";
import { Fruit } from "schemas/fruit.schema";

export class UpdateFruitCategoryDto {
    @IsOptional()
    @IsString()
    category_name: string;

    @IsOptional()
    range_price: number[];

    @IsOptional()
    @IsArray()
    shape: string[];

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    dimeter: number[];

    @IsOptional()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    weight: number[];

    @IsOptional()
    @IsArray()
    fruits?: Fruit[];
}
