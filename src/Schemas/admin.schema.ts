import { USER_ROLES } from "@constants/common.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { DeviceSession } from "@schemas/device_session.schema";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export type AdminDocument = HydratedDocument<Admin>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "admins",
})
export class Admin extends BaseSchema {
    @Prop({ unique: true, required: true, sparse: true })
    email: string;

    @Prop({ required: true })
    user_name: string;

    @Prop({ required: true })
    password: string;

    @Prop({
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.ADMIN,
    })
    role: USER_ROLES;

    @Prop({ default: false })
    email_verified?: boolean;

    @Prop({ default: false })
    phone_verified?: boolean;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceSession",
        },
    ])
    device_sessions?: DeviceSession[];
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
