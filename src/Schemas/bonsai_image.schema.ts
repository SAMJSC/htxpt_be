import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type BonsaiImageDocument = HydratedDocument<BonsaiImage>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "bonsai_images",
})
export class BonsaiImage {
    @Prop()
    url: string;

    @Prop()
    public_id: string;
}

export const BonsaiImageSchema = SchemaFactory.createForClass(BonsaiImage);
