import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateFruitSpecialDto {
    @IsNotEmpty()
    @IsString()
    readonly fruit_name: string;

    @IsOptional()
    readonly fruit_images: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsNotEmpty()
    readonly price: number;

    @IsNotEmpty()
    readonly shape: string;

    @IsNotEmpty()
    readonly dimeter: number;

    @IsNotEmpty()
    readonly weight: number;
}
