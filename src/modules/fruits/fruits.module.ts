import { FruitsController } from "@modules/fruits/fruits.controller";
import { FruitsService } from "@modules/fruits/fruits.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Fruit, FruitSchema } from "@schemas/fruit.schema";
import {
    FruitCategory,
    FruitCategorySchema,
} from "@schemas/fruit_categorie.chema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Fruit.name, schema: FruitSchema },
            { name: FruitCategory.name, schema: FruitCategorySchema },
        ]),
    ],
    controllers: [FruitsController],
    exports: [FruitsService],
    providers: [FruitsService],
})
export class FruitsModule {}
