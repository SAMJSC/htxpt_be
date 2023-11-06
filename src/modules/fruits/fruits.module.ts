import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { FruitsController } from "@modules/fruits/fruits.controller";
import { FruitsService } from "@modules/fruits/fruits.service";
import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Fruit, FruitSchema } from "@schemas/fruit.schema";
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
import { FruitRepository } from "repository/fruit.repository";
import { FruitCategoryRepository } from "repository/fruit-category.repository";
import { FruitImageRepository } from "repository/fruit-image.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Fruit.name, schema: FruitSchema },
            { name: FruitCategory.name, schema: FruitCategorySchema },
            { name: SpecialFruit.name, schema: FruitSpecialSchema },
            { name: FruitImage.name, schema: FruitImageSchema },
            { name: Gardener.name, schema: GardenerSchema },
        ]),
        CloudinaryModule,
        HttpModule,
    ],
    controllers: [FruitsController],
    exports: [FruitsService],
    providers: [
        FruitsService,
        { provide: "FruitRepositoryInterface", useClass: FruitRepository },
        {
            provide: "FruitImageRepositoryInterface",
            useClass: FruitImageRepository,
        },
        {
            provide: "FruitCategoryRepositoryInterface",
            useClass: FruitCategoryRepository,
        },
    ],
})
export class FruitsModule {}
