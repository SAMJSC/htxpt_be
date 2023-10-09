import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Customer } from "@schemas/customer.schema";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export type CustomerAvatarDocument = HydratedDocument<CustomerAvatar>;

@Schema({
    timestamps: { createdAt: "create_at", updatedAt: "update_at" },
    collection: "customer_avatars",
})
export class CustomerAvatar extends BaseSchema {
    @Prop()
    url: string;

    @Prop()
    public_id: string;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Customer,
        },
    ])
    customer: string;
}

export const CustomerAvatarSchema =
    SchemaFactory.createForClass(CustomerAvatar);
