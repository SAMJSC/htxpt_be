import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { FruitCategory } from "schemas/fruit_categorie.chema";
import { FruitImage } from "schemas/fruit_image.schema";
import { Garden } from "schemas/garden.schema";

export type FruitDocument = HydratedDocument<Fruit>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruits",
})
export class Fruit {
    @Prop()
    fruit_name: string;

    @Prop()
    quantity: number;

    @Prop()
    range_price: number[];

    @Prop()
    shape: string[];

    @Prop()
    dimeter: number[];

    @Prop()
    weight: number[];

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gardens",
        required: false,
    })
    gardens?: Garden;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitCategories",
        required: false,
    })
    fruit_categories?: FruitCategory;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitImage",
        required: false,
    })
    fruit_images?: FruitImage;
}

export const FruitSchema = SchemaFactory.createForClass(Fruit);
