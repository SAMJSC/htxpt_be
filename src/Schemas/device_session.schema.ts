import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Admin } from "@schemas/admin.schema";
import mongoose, { Document } from "mongoose";
import { Garden } from "schemas/garden.schema";

export type DeviceSessionDocument = DeviceSession & Document;

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class DeviceSession {
    @Prop({ required: true })
    device_id: string;

    @Prop()
    name: string;

    @Prop({ required: true })
    ua: string;

    @Prop({ required: true })
    refresh_token: string;

    @Prop({ required: true })
    expired_at: Date;

    @Prop({ required: true })
    ip_address: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Gardens" })
    gardener: Garden;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Admin" })
    admin: Admin;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Admin" })
    super_admin: Admin;
}

export const DeviceSessionSchema = SchemaFactory.createForClass(DeviceSession);
