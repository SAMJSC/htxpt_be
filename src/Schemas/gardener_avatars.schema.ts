import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Gardener } from "@schemas/garden.schema";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export type GardenerAvatarDocument = HydratedDocument<GardenerAvatar>;

@Schema({
    timestamps: { createdAt: "create_at", updatedAt: "update_At" },
    collection: "gardener_avatars",
})
export class GardenerAvatar extends BaseSchema {
    @Prop()
    url: string;

    @Prop()
    public_id: string;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: Gardener,
        },
    ])
    gardener: string;
}

export const GardenerAvatarSchema =
    SchemaFactory.createForClass(GardenerAvatar);
