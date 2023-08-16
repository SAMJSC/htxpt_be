import { Transform } from "class-transformer";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";
import mongoose from "mongoose";

export class CreateFruitSpecialDto {
    @IsNotEmpty()
    @IsString()
    readonly fruit_name: string;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    readonly fruit_images: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsNotEmpty()
    readonly range_price: number[];

    @IsNotEmpty()
    readonly shape: string[];

    @IsNotEmpty()
    readonly dimeter: number[];

    @IsNotEmpty()
    readonly weight: number[];
}
