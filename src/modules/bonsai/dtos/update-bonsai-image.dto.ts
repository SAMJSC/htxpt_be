import { IsOptional } from "class-validator";
import mongoose from "mongoose";

export class UpdateBonsaiImageDto {
    @IsOptional()
    readonly bonsai_images?: mongoose.Schema.Types.ObjectId[];
}
