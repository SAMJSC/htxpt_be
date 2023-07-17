import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { FruitsController } from "@modules/fruits/fruits.controller";
import { FruitsService } from "@modules/fruits/fruits.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
    FruitSpecial,
    FruitSpecialSchema,
} from "@schemas/friuitSpecial.schema";
import { Fruit, FruitSchema } from "@schemas/fruit.schema";
import {
    FruitCategory,
    FruitCategorySchema,
} from "@schemas/fruit_categorie.chema";
import { FruitImage, FruitImageSchema } from "@schemas/fruit_image.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Fruit.name, schema: FruitSchema },
            { name: FruitCategory.name, schema: FruitCategorySchema },
            { name: FruitSpecial.name, schema: FruitSpecialSchema },
            { name: FruitImage.name, schema: FruitImageSchema },
        ]),
        CloudinaryModule,
    ],
    controllers: [FruitsController],
    exports: [FruitsService],
    providers: [FruitsService],
})
export class FruitsModule {}
