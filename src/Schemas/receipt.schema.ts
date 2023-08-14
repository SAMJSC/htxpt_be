import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { Bonsai } from "schemas/bonsai_tree.schema";
import { Customer } from "schemas/customer.schema";
import { Fruit } from "schemas/fruit.schema";
import { Gardener } from "schemas/garden.schema";

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "receipt",
})
export class Receipt {
    @Prop()
    fruit_name: string;

    @Prop([
        { type: mongoose.Schema.Types.ObjectId, refPath: "list_products.type" },
    ])
    list_products: Array<Fruit | Bonsai>;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Garden",
        required: true,
    })
    garden: Gardener;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    })
    customer: Customer;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
