import { Transform } from "class-transformer";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";
import mongoose from "mongoose";

export class CreateFruitsDto {
    @IsNotEmpty()
    @IsString()
    readonly fruit_name: string;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    readonly fruit_categories: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    readonly fruit_images: mongoose.Schema.Types.ObjectId;

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

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly fruit_category_quantity: number;
}
