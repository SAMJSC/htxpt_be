import { GENDER, USER_ROLES } from "@constants/common.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { DeviceSession } from "@schemas/device_session.schema";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "customers",
})
export class Customer extends BaseSchema {
    @Prop({ unique: true })
    email?: string;

    @Prop()
    first_name?: string;

    @Prop({ name: "user_name" })
    user_name?: string;

    @Prop()
    middle_name?: string;

    @Prop({ required: true })
    last_name: string;

    @Prop()
    date_of_birth?: Date;

    @Prop()
    phone?: string;

    @Prop()
    avatar?: string;

    @Prop()
    address?: string;

    @Prop()
    age?: number;

    @Prop({ type: String, enum: Object.values(GENDER) })
    gender?: GENDER;

    @Prop({ required: true })
    password: string;

    @Prop()
    reset_token?: string;

    @Prop({
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.CUSTOMER,
    })
    role: USER_ROLES;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceSession",
        },
    ])
    device_sessions?: DeviceSession[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
