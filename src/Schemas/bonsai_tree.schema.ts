import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { BonsaiImage } from "@schemas/bonsai_image.schema";
import mongoose, { HydratedDocument } from "mongoose";
import { Gardener } from "schemas/garden.schema";

export type BonsaiDocument = HydratedDocument<Bonsai>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "bonsai_trees",
})
export class Bonsai {
    @Prop()
    tree_name: string;

    @Prop()
    description: string;

    @Prop()
    quantity: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gardens",
        required: true,
    })
    gardens: Gardener;

    @Prop([
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "BonsaiImages",
            required: true,
        },
    ])
    bonsai_images: BonsaiImage;
}

export const BonsaiSchema = SchemaFactory.createForClass(Bonsai);
