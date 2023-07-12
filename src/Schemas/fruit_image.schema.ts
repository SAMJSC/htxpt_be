import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type FruitImageDocument = HydratedDocument<FruitImage>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruits_images",
})
export class FruitImage {
    @Prop()
    url: string;
}

export const FruitImageSchema = SchemaFactory.createForClass(FruitImage);
