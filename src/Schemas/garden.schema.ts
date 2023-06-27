import {
    GENDER,
    PRODUCT_CATEGORY,
    USER_ROLES,
} from "@constants/common.constants";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "@shared/base.schema";
import { Exclude, Expose } from "class-transformer";
import { Max, Min } from "class-validator";
import { NextFunction } from "express";
import mongoose, { HydratedDocument, Model } from "mongoose";
import { Bonsai } from "schemas/bonsai_tree.schema";
import {
    DeviceSession,
    DeviceSessionDocument,
} from "schemas/device_session.schema";
import { Fruit } from "schemas/fruit.schema";

export type GardensDocument = HydratedDocument<Garden>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "gardens",
    toJSON: {
        virtuals: true,
        getters: true,
        transform: (doc, ret) => {
            delete ret.password;
            delete ret.reset_token;
            delete ret.rating_quantity;
            delete ret.deleted_at;
            delete ret.id;
            delete ret.device_sessions;
            return ret;
        },
    },
})
export class Garden extends BaseSchema {
    @Prop({ unique: true })
    email?: string;

    @Prop({
        minlength: 2,
        maxlength: 60,
        set: (first_name: string) => {
            return first_name.trim();
        },
    })
    first_name?: string;

    @Prop({ name: "user_name" })
    user_name?: string;

    @Prop({
        minlength: 2,
        maxlength: 60,
        set: (middle_name: string) => {
            return middle_name.trim();
        },
    })
    middle_name?: string;

    @Prop({
        required: true,
        minlength: 2,
        maxlength: 60,
        set: (last_name: string) => {
            return last_name.trim();
        },
    })
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

    @Prop({ required: true })
    @Exclude({ toPlainOnly: true })
    @Expose()
    password: string;

    @Prop()
    @Exclude()
    reset_token?: string;

    @Prop({ default: 0 })
    @Min(1)
    @Max(5)
    rating_avg?: number;

    @Prop({ default: 0 })
    rating_quantity?: number;

    @Prop()
    product_category?: PRODUCT_CATEGORY;

    @Prop()
    response_rate?: number;

    @Prop({
        type: String,
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.USER,
    })
    role?: USER_ROLES;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Fruit.name,
        },
    ])
    fruits?: Fruit[];

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Bonsai.name,
        },
    ])
    bonsai?: Bonsai[];

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DeviceSession",
        },
    ])
    device_sessions?: DeviceSession[];
}

export const GardensSchema = SchemaFactory.createForClass(Garden);

export const GardenSchemaFactory = (
    deviceSessionModel: Model<DeviceSessionDocument>
) => {
    const garden_schema = GardensSchema;

    garden_schema.pre("findOneAndDelete", async function (next: NextFunction) {
        const garden = await this.model.findOne(this.getFilter());
        deviceSessionModel.deleteMany({ garden: garden._id });
        return next();
    });

    garden_schema.virtual("full_name").get(function (this: GardensDocument) {
        return `${this.first_name} ${this.middle_name} ${this.last_name} `;
    });
    return garden_schema;
};
