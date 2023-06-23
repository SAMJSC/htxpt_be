import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: { createdAt: "created_at", updatedAt: "updated_at" } })
export class User {
    @Prop({ unique: true })
    email?: string;

    @Prop({ required: true })
    password: string;
    // @Prop({ required: true })
    // last_name: string;

    // @Prop()
    // middle_name?: string;

    // @Prop()
    // address?: string;

    // @Prop()
    // age?: number;

    // @Prop({ type: String, enum: Object.values(Gender) })
    // gender?: Gender;

    // @Prop({ name: "user_name", required: true })
    // user_name: string;

    // @Prop({ required: true })
    // password: string;

    // @Prop()
    // reset_token?: string;

    // @Prop()
    // first_name?: string;

    // @Prop({
    //     type: String,
    //     enum: Object.values(UserRoles),
    //     default: UserRoles.USER,
    // })
    // role: UserRoles;

    // @Prop({ unique: true })
    // email?: string;

    // @Prop()
    // date_of_birth?: Date;

    // @Prop()
    // phone?: string;

    // @Prop()
    // avatar?: string;

    // @Prop({
    //     type: [{ type: mongoose.Schema.Types.ObjectId, ref: "DeviceSession" }],
    // })
    // device_sessions: DeviceSession;
}

export const UserSchema = SchemaFactory.createForClass(User);
