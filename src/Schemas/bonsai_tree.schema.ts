import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BonsaiImage } from "@schemas/bonsai_image.schema";
import { BaseSchema } from "@shared/base.schema";
import mongoose, { HydratedDocument } from "mongoose";
import { Gardener } from "schemas/garden.schema";

export type BonsaiDocument = HydratedDocument<Bonsai>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "bonsai_trees",
})
export class Bonsai extends BaseSchema {
    @Prop()
    tree_name: string;

    @Prop()
    description: string;

    @Prop()
    quantity: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gardener",
        required: true,
    })
    gardens: Gardener;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BonsaiImage",
            required: true,
        },
    ])
    bonsai_images: BonsaiImage[];
}

export const BonsaiSchema = SchemaFactory.createForClass(Bonsai);
