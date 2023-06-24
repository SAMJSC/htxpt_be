import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FruitImagesDocument = HydratedDocument<FruitImages>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruits_images",
})
export class FruitImages {
    @Prop()
    url: string;
}

export const FruitImagesSchema = SchemaFactory.createForClass(FruitImages);
