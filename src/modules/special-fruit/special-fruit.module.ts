import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { SpecialFruitController } from "@modules/special-fruit/special-fruit.controller";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
    FruitCategory,
    FruitCategorySchema,
} from "@schemas/fruit_category.chema";
import { FruitImage, FruitImageSchema } from "@schemas/fruit_image.schema";
import {
    FruitSpecialSchema,
    SpecialFruit,
} from "@schemas/special_fruit.schema";
import { SpecialFruitRepository } from "repository/special-fruit.repository";

import { SpecialFruitService } from "./special-fruit.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FruitCategory.name, schema: FruitCategorySchema },
            { name: SpecialFruit.name, schema: FruitSpecialSchema },
            { name: FruitImage.name, schema: FruitImageSchema },
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
    ],
})
export class SpecialFruitModule {}
