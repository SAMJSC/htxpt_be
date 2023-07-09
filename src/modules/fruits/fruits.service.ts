import { CreateFruitsDto } from "@modules/fruits/dtos/create-fruits.dto";
import { UpdateFruitsDto } from "@modules/fruits/dtos/update-fruits.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Fruit } from "@schemas/fruit.schema";
import {
    FruitCategory,
    FruitCategoryDocument,
} from "@schemas/fruit_categorie.chema";
import { Model } from "mongoose";

@Injectable()
export class FruitsService {
    constructor(
        @InjectModel(Fruit.name)
        private fruitModel: Model<Fruit>,
        @InjectModel(FruitCategory.name)
        private readonly fruitCategoryModel: Model<FruitCategoryDocument>
    ) {}

    async createFruit(
        createFruitDto: CreateFruitsDto,
        gardens: any
    ): Promise<void> {
        try {
            const fruitCategory = new this.fruitCategoryModel({
                category_name: createFruitDto.fruit_category_name,
                range_price: createFruitDto.range_price,
                shape: createFruitDto.shape,
                dimeter: createFruitDto.dimeter,
                weight: createFruitDto.weight,
                fruit_category_quantity: createFruitDto.fruit_category_quantity,
            });
            const createFruit = new this.fruitModel({
                ...createFruitDto,
                gardens: gardens,
                fruit_categories: fruitCategory,
            });
            Promise.all([await fruitCategory.save(), await createFruit.save()]);
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException(
                    "Fruit already exists",
                    HttpStatus.CONFLICT
                );
            }
            throw error;
        }
    }

    async getAllFruit(): Promise<Fruit[]> {
        const fruits = await this.fruitModel.find().exec();
        return fruits;
    }

    async getFruitsById(fruitID: string): Promise<Fruit> {
        return await this.fruitModel.findById(fruitID).exec();
    }

    async updateFruits(
        fruitID: string,
        updateFruitsDto: UpdateFruitsDto
    ): Promise<Fruit> {
        const updatedFruits = await this.fruitModel.findByIdAndUpdate(
            fruitID,
            updateFruitsDto
        );
        const fruitNew = await this.fruitModel.findById(updatedFruits.id);
        return fruitNew;
    }

    async deleteFruits(fruitID: string): Promise<any> {
        const deletedFruits = await this.fruitModel.findByIdAndRemove(fruitID);
        return deletedFruits;
    }
}
