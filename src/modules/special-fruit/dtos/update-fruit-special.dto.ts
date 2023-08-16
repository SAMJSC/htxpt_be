import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";
import mongoose from "mongoose";

export class UpdateFruitSpecialDto {
    @IsOptional()
    @IsString()
    readonly fruit_name: string;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    fruit_images: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    readonly range_price: number[];

    @IsOptional()
    readonly shape: string[];

    @IsOptional()
    readonly dimeter: number[];

    @IsOptional()
    readonly weight: number[];
}
