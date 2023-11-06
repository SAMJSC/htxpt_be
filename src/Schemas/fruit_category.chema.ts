import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";
import { Fruit } from "schemas/fruit.schema";

export type FruitCategoryDocument = HydratedDocument<FruitCategory>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruit_categories",
})
export class FruitCategory extends BaseSchema {
    @Prop({ unique: true })
    category_name: string;

    @Prop()
    range_price: number[];

    @Prop()
    shape: string[];

    @Prop()
    dimeter: number[];

    @Prop()
    weight: number[];

    @Prop({ default: 0 })
    quantity?: number;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fruits",
        },
    ])
    fruits?: Fruit[];
}

export const FruitCategorySchema = SchemaFactory.createForClass(FruitCategory);
