import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";

export type BonsaiImageDocument = HydratedDocument<BonsaiImage>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "bonsai_images",
})
export class BonsaiImage extends BaseSchema {
    @Prop()
    url: string;

    @Prop()
    public_id: string;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: "Bonsai" }])
    bonsai: string;
}

export const BonsaiImageSchema = SchemaFactory.createForClass(BonsaiImage);
