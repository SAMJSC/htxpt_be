import {
    IsArray,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
} from "class-validator";
import { Fruit } from "schemas/fruit.schema";

export class CreateFruitCategoryDto {
    @IsNotEmpty()
    @IsString()
    category_name: string;

    @IsNotEmpty()
    range_price: number[];

    @IsArray()
    @IsString({ each: true })
    shape: string[];

    @IsArray()
    @IsNumber({}, { each: true })
    dimeter: number[];

    @IsArray()
    @IsNumber({}, { each: true })
    weight: number[];

    @IsOptional()
    @IsArray()
    fruits?: Fruit[];
}
