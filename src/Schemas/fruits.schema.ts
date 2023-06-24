import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { FruitCategories } from "schemas/fruit_categories.chema";
import { FruitImages } from "schemas/fruit_images.schema";
import { Garden } from "schemas/garden.schema";

export type FruitsDocument = HydratedDocument<Fruits>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruits",
})
export class Fruits {
    @Prop()
    fruit_name: string;

    @Prop()
    quantity: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gardens",
        required: true,
    })
    gardens: Garden;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitCategories",
        required: true,
    })
    fruit_categories: FruitCategories;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitImages",
        required: true,
    })
    fruit_images: FruitImages;
}

export const FruitsSchema = SchemaFactory.createForClass(Fruits);
