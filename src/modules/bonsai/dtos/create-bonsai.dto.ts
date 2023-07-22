import { Transform } from "class-transformer";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from "class-validator";
import mongoose from "mongoose";

export class CreateBonsaiDto {
    @IsNotEmpty()
    @IsString()
    readonly tree_name: string;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    readonly bonsai_images: mongoose.Schema.Types.ObjectId[];

    @IsNotEmpty()
    @IsString()
    readonly description: string;
}
