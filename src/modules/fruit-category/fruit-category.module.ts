import { FruitCategoryController } from "@modules/fruit-category/fruit-category.controller";
import { FruitCategoryService } from "@modules/fruit-category/fruit-category.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
    FruitCategory,
    FruitCategorySchema,
} from "@schemas/fruit_category.chema";
import { FruitCategoryRepository } from "repository/fruit-category.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FruitCategory.name, schema: FruitCategorySchema },
        ]),
    ],
    controllers: [FruitCategoryController],
    exports: [FruitCategoryService],
    providers: [
        FruitCategoryService,
        {
            provide: "FruitCategoryRepositoryInterface",
            useClass: FruitCategoryRepository,
        },
    ],
})
export class FruitCategoryModule {}
