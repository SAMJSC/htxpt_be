import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "@shared/base.schema";
import { Max, Min } from "class-validator";
import mongoose, { HydratedDocument } from "mongoose";

export type BlogDocument = HydratedDocument<Blog>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "blog",
})
export class Blog extends BaseSchema {
    @Prop()
    title: string;

    @Prop()
    content: string;

    @Prop()
    short_description: string;

    @Prop({ default: 0 })
    @Min(1)
    @Max(5)
    rating_avg?: number;

    @Prop({ default: 0 })
    rating_quantity: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    })
    auth: mongoose.Types.ObjectId;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
