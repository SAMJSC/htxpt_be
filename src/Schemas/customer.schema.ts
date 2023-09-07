import { GENDER, USER_ROLES } from "@constants/common.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { DeviceSession } from "@schemas/device_session.schema";
import { BaseSchema } from "@shared/base.schema";
import { Exclude, Expose } from "class-transformer";
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

    @Prop({
        unique: true,
        get: (phone: string) => {
            if (!phone) {
                return;
            }
            const phoneNumber = phone.replace(/\D/g, "").replace(/^84/, "0");
            return phoneNumber;
        },
    })
    phone?: string;

    @Prop()
    avatar?: string;

    @Prop()
    address?: string;

    @Prop()
    age?: number;

    @Prop({ type: String, enum: Object.values(GENDER) })
    gender?: GENDER;

    @Prop()
    @Exclude({ toPlainOnly: true })
    @Expose()
    password?: string;

    @Prop()
    reset_token?: string;

    @Prop({ type: String, enum: ["local", "google"], default: "local" })
    authen_method?: string;

    @Prop({
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.CUSTOMER,
    })
    role: USER_ROLES;

    @Prop({ default: false })
    email_verified?: boolean;

    @Prop({ default: false })
    phone_verified?: boolean;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Gardener",
        },
    ])
    favorite_gardeners?: string[];

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceSession",
        },
    ])
    device_sessions?: DeviceSession[];
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
