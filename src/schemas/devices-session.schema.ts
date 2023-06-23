import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { User } from "schemas/users.schema";

export type DeviceSessionDocument = HydratedDocument<DeviceSession>;

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class DeviceSession {
    @Prop({ required: true })
    deviceId: string;

    @Prop()
    name?: string;

    @Prop({ required: true })
    ua: string;

    @Prop({ required: true, type: String })
    refresh_token: string;

    @Prop({ required: true })
    expired_at: Date;

    @Prop({ required: true })
    ip_address: string;

    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    user_id: User;
}

export const DeviceSessionSchema = SchemaFactory.createForClass(DeviceSession);
