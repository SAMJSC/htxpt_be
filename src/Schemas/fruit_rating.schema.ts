import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { FruitCategory } from "@schemas/fruit_category.chema";
import mongoose, { HydratedDocument } from "mongoose";

import { Customer } from "./customer.schema";

export type RatingDocument = HydratedDocument<Rating>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "ratings",
})
export class Rating {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    })
    customer: Customer;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitCategory",
        required: true,
    })
    fruit: FruitCategory;

    @Prop({
        type: Number,
        min: 1,
        max: 5,
        required: true,
    })
    rating: number;
}

export const RatingSchema = SchemaFactory.createForClass(Rating);
