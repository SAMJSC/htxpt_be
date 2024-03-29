import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";
import { FruitImage } from "schemas/fruit_image.schema";
import { Gardener } from "schemas/garden.schema";

export type SpecialFruitDocument = HydratedDocument<SpecialFruit>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruit_special",
})
export class SpecialFruit extends BaseSchema {
    @Prop()
    fruit_name: string;

    @Prop()
    quantity: number;

    @Prop()
    price: number;

    @Prop()
    shape: string[];

    @Prop()
    dimeter: number;

    @Prop()
    weight: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gardens",
        required: false,
    })
    gardens?: Gardener;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FruitImage",
            required: false,
        },
    ])
    fruit_images?: FruitImage[];
}

export const FruitSpecialSchema = SchemaFactory.createForClass(SpecialFruit);
