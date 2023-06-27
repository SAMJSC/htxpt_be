import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";
import { FruitImage } from "schemas/fruit_image.schema";
import { Garden } from "schemas/garden.schema";

export type BonsaiDocument = HydratedDocument<Bonsai>;

@Schema({
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    collection: "bonsai_trees",
})
export class Bonsai {
    @Prop()
    tree_name: string;

    @Prop()
    quantity: number;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "Gardens",
        required: true,
    })
    gardens: Garden;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "FruitImages",
        required: true,
    })
    fruit_images: FruitImage;
}

export const BonsaiSchema = SchemaFactory.createForClass(Bonsai);
