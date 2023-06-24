import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Fruits } from "schemas/fruits.schema";

export type FruitCategoriesDocument = HydratedDocument<FruitCategories>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "fruit_categories",
})
export class FruitCategories {
    @Prop()
    category_name: string;

    @Prop()
    range_price: number[];

    @Prop()
    shape: string[];

    @Prop()
    dimeter: number[];

    @Prop()
    weight: number[];

    @Prop()
    quantity: number;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Fruits",
        },
    ])
    fruits?: Fruits[];
}

export const FruitCategoriesSchema =
    SchemaFactory.createForClass(FruitCategories);
