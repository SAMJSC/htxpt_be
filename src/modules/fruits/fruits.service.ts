import { CreateFruitSpecialDto } from "@modules/fruits/dtos/create-fruit-special.dto";
import { CreateFruitsDto } from "@modules/fruits/dtos/create-fruits.dto";
import { UpdateFruitSpecialDto } from "@modules/fruits/dtos/update-fruit-special.dto";
import { UpdateFruitsDto } from "@modules/fruits/dtos/update-fruits.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FruitSpecial } from "@schemas/friuitSpecial.schema";
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
        @InjectModel(FruitSpecial.name)
        private fruitSpecialModel: Model<FruitSpecial>,
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
                quantity: createFruitDto.fruit_category_quantity,
            });

            const checkFruitCategory = await this.fruitCategoryModel
                .findOne({ category_name: createFruitDto.fruit_category_name })
                .exec();

            if (checkFruitCategory) {
                const createFruit = new this.fruitModel({
                    ...createFruitDto,
                    gardens: gardens,
                    fruit_categories: checkFruitCategory,
                });
                await createFruit.save();
            } else {
                const createFruit = new this.fruitModel({
                    ...createFruitDto,
                    gardens: gardens,
                    fruit_categories: fruitCategory,
                });
                Promise.all([
                    await fruitCategory.save(),
                    await createFruit.save(),
                ]);
            }
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
    async createFruitSpecial(
        createFruitDto: CreateFruitSpecialDto,
        gardens: any
    ): Promise<void> {
        try {
            const createFruitSpecial = new this.fruitSpecialModel({
                fruit_name: createFruitDto.fruit_name,
                range_price: createFruitDto.range_price,
                shape: createFruitDto.shape,
                dimeter: createFruitDto.dimeter,
                weight: createFruitDto.weight,
                quantity: createFruitDto.quantity,
                gardens: gardens,
            });
            await createFruitSpecial.save();
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
    async getAllFruitSpecial(): Promise<FruitSpecial[]> {
        const fruitSpecial = await this.fruitSpecialModel.find().exec();
        return fruitSpecial;
    }

    async getAllFruit(): Promise<Fruit[]> {
        const fruits = await this.fruitModel.find().exec();
        return fruits;
    }

    async getFruitsById(fruitID: string): Promise<Fruit> {
        return await this.fruitModel.findById(fruitID).exec();
    }

    async getFruitSpecialById(fruitSpecialID: string): Promise<FruitSpecial> {
        return await this.fruitSpecialModel.findById(fruitSpecialID).exec();
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

    async updateFruitSpecial(
        fruitSpecialID: string,
        updateFruitSpecialDto: UpdateFruitSpecialDto
    ): Promise<FruitSpecial> {
        const updatedFruitSpecial =
            await this.fruitSpecialModel.findByIdAndUpdate(
                fruitSpecialID,
                updateFruitSpecialDto
            );
        const fruitNew = await this.fruitSpecialModel.findById(
            updatedFruitSpecial.id
        );
        return fruitNew;
    }

    async deleteFruits(fruitID: string): Promise<any> {
        const deletedFruits = await this.fruitModel.findByIdAndRemove(fruitID);
        return deletedFruits;
    }

    async deleteFruitSpecial(fruitSpecialID: string): Promise<any> {
        const deletedFruitSpecial =
            await this.fruitSpecialModel.findByIdAndRemove(fruitSpecialID);
        return deletedFruitSpecial;
    }
}
