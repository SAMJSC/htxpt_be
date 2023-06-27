import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

import { Customer } from "./customer.schema";
import { Garden } from "./garden.schema";

export type GardenRatingDocument = HydratedDocument<GardenRating>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "garden_ratings",
})
export class GardenRating {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    })
    customer: Customer;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Garden",
        required: true,
    })
    garden: Garden;

    @Prop({
        type: Number,
        min: 1,
        max: 5,
        required: true,
    })
    rating: number;
}

export const GardenRatingSchema = SchemaFactory.createForClass(GardenRating);
