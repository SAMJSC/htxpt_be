import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { FruitImage } from "schemas/fruit_image.schema";
import { Gardener } from "schemas/garden.schema";

export type FruitSpecialDocument = HydratedDocument<FruitSpecial>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruitSpecial",
})
export class FruitSpecial {
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
    gardens?: Gardener;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitImages",
        required: false,
    })
    fruit_images?: FruitImage;
}

export const FruitSpecialSchema = SchemaFactory.createForClass(FruitSpecial);
