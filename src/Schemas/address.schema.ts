import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "@shared/base.schema";
import { Exclude } from "class-transformer";
import { Max, Min } from "class-validator";
import { HydratedDocument } from "mongoose";

export type AddressDocument = HydratedDocument<Address>;

@Schema()
export class Address extends BaseSchema {
    @Prop({ minlength: 2, maxlength: 120 })
    street?: string;

    @Prop({ required: true, minlength: 2, maxlength: 50 })
    state: string;

    @Prop({ required: true, minlength: 2, maxlength: 50 })
    city: string;

    @Prop({ required: false, minlength: 2, maxlength: 50 })
    @Exclude()
    postal_code?: number;

    @Prop({ required: true, minlength: 2, maxlength: 50 })
    country: string;

    @Prop({ default: 0 })
    @Min(1)
    @Max(5)
    rating_avg?: number;

    @Prop({ default: 0 })
    rating_quantity: number;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
