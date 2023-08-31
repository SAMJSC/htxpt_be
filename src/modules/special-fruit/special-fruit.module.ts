import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { SpecialFruitController } from "@modules/special-fruit/special-fruit.controller";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
    FruitCategory,
    FruitCategorySchema,
} from "@schemas/fruit_category.chema";
import { FruitImage, FruitImageSchema } from "@schemas/fruit_image.schema";
import { Gardener, GardenerSchema } from "@schemas/garden.schema";
import {
    FruitSpecialSchema,
    SpecialFruit,
} from "@schemas/special_fruit.schema";
import { FruitImageRepository } from "repository/fruit-image.repository";
import { SpecialFruitRepository } from "repository/special-fruit.repository";

import { SpecialFruitService } from "./special-fruit.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FruitCategory.name, schema: FruitCategorySchema },
            { name: SpecialFruit.name, schema: FruitSpecialSchema },
            { name: FruitImage.name, schema: FruitImageSchema },
            { name: Gardener.name, schema: GardenerSchema },
        ]),
        CloudinaryModule,
    ],
    controllers: [SpecialFruitController],
    providers: [
        SpecialFruitService,
        {
            provide: "SpecialFruitRepositoryInterface",
            useClass: SpecialFruitRepository,
        },
        {
            provide: "FruitImageRepositoryInterface",
            useClass: FruitImageRepository,
        },
    ],
})
export class SpecialFruitModule {}
