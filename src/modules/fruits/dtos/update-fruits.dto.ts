import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import mongoose from "mongoose";

export class UpdateFruitsDto {
    @IsOptional()
    @IsString()
    readonly fruit_name: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    readonly fruit_categories: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    fruit_images: mongoose.Schema.Types.ObjectId;

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

    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly fruit_category_quantity: number;
}
