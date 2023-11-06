import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Fruit } from "@schemas/fruit.schema";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export type FruitImageDocument = HydratedDocument<FruitImage>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruits_images",
})
export class FruitImage extends BaseSchema {
    @Prop()
    url: string;

    @Prop()
    public_id: string;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Fruit,
        },
    ])
    fruit: string;
}

export const FruitImageSchema = SchemaFactory.createForClass(FruitImage);
