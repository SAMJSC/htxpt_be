import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Max, Min } from "class-validator";
import { HydratedDocument } from "mongoose";

export type BlogDocument = HydratedDocument<Blog>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "blog",
})
export class Blog {
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
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
