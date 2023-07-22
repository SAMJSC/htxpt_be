import { BonsaiController } from "@modules/bonsai/bonsai.controller";
import { BonsaiService } from "@modules/bonsai/bonsai.service";
import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { BonsaiImage, BonsaiImageSchema } from "@schemas/bonsai_image.schema";
import { Bonsai, BonsaiSchema } from "@schemas/bonsai_tree.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Bonsai.name, schema: BonsaiSchema },
            { name: BonsaiImage.name, schema: BonsaiImageSchema },
        ]),
        CloudinaryModule,
    ],
    controllers: [BonsaiController],
    exports: [BonsaiService],
    providers: [BonsaiService],
})
export class BonsaiModule {}
