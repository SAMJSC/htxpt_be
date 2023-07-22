import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
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
import { FruitImage } from "@schemas/fruit_image.schema";
import { Express } from "express";
import { Model } from "mongoose";
@Injectable()
export class FruitsService {
    constructor(
        @InjectModel(Fruit.name)
        private fruitModel: Model<Fruit>,
        @InjectModel(FruitSpecial.name)
        private fruitSpecialModel: Model<FruitSpecial>,
        @InjectModel(FruitCategory.name)
        private readonly fruitCategoryModel: Model<FruitCategoryDocument>,
        private cloudinaryService: CloudinaryService,
        @InjectModel(FruitImage.name)
        private fruitImage: Model<FruitImage>
    ) {}

    async createFruit(
        createFruitDto: CreateFruitsDto,
        gardens: any,
        image?: Express.Multer.File
    ): Promise<void> {
        try {
            let newImage;
            let newFruit;
            if (image) {
                const uploadResult = await this.cloudinaryService.uploadFile(
                    image
                );
                newImage = new this.fruitImage({
                    url: uploadResult.url,
                    public_id: uploadResult.public_id,
                });
                await newImage.save();
            }

            const isFruitCategoryName = await this.fruitCategoryModel.findOne({
                category_name: createFruitDto.fruit_category_name,
            });

            if (!isFruitCategoryName) {
                throw new HttpException(
                    "Error! can't found fruit category",
                    HttpStatus.NOT_FOUND
                );
            }

            const checkFruitCategory = await this.fruitCategoryModel
                .findOne({ category_name: createFruitDto.fruit_category_name })
                .exec();

            const isFruitCategory = await this.fruitModel.findOne({
                fruit_categories: checkFruitCategory._id,
            });

            const newImageId = newImage ? newImage._id : null;

            if (isFruitCategory && checkFruitCategory) {
                const fruitImagesArray = Array.isArray(
                    isFruitCategory.fruit_images
                )
                    ? isFruitCategory.fruit_images
                    : [isFruitCategory.fruit_images];

                if (newImageId) {
                    fruitImagesArray.unshift(newImageId);
                }

                await this.fruitModel.findByIdAndUpdate(isFruitCategory._id, {
                    fruit_name: createFruitDto.fruit_name,
                    gardens: gardens,
                    quantity:
                        isFruitCategory.quantity + createFruitDto.quantity,
                    fruit_categories: isFruitCategory.fruit_categories,
                    fruit_images: fruitImagesArray,
                });
            } else {
                const createFruit = new this.fruitModel({
                    fruit_name: createFruitDto.fruit_name,
                    quantity: createFruitDto.quantity,
                    gardens: gardens,
                    fruit_categories: isFruitCategoryName,
                    fruit_images: [newImageId],
                });
                newFruit = await createFruit.save();
                return newFruit;
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
        const fruits = await this.fruitModel
            .find()
            .populate("fruit_images")
            .exec();
        return fruits;
    }

    async getFruitsById(fruitID: string): Promise<Fruit> {
        return await this.fruitModel
            .findById(fruitID)
            .populate("fruit_images")
            .exec();
    }

    async getFruitSpecialById(fruitSpecialID: string): Promise<FruitSpecial> {
        return await this.fruitSpecialModel.findById(fruitSpecialID).exec();
    }

    async updateFruits(
        fruitID: string,
        updateFruitsDto: UpdateFruitsDto,
        image?: Express.Multer.File // add this line
    ): Promise<Fruit> {
        let newImage;

        if (image) {
            const uploadResult = await this.cloudinaryService.uploadFile(image);
            newImage = new this.fruitImage({
                url: uploadResult.url,
                public_id: uploadResult.public_id,
            });
            await newImage.save();

            updateFruitsDto.fruit_images = newImage._id;
        }

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
        const fruit = await this.fruitModel.findById(fruitID);
        const fruitImage = await this.fruitImage.findById(fruit.fruit_images);

        if (fruit) {
            await this.cloudinaryService.deleteFile(fruitImage.public_id);

            await this.fruitImage.findByIdAndRemove(fruit.fruit_images);

            const deletedFruits = await this.fruitModel.findByIdAndRemove(
                fruitID
            );
            return deletedFruits;
        } else {
            throw new HttpException(
                `Fruit with ID ${fruitID} not found`,
                HttpStatus.NOT_FOUND
            );
        }
    }

    async deleteFruitSpecial(fruitSpecialID: string): Promise<any> {
        const deletedFruitSpecial =
            await this.fruitSpecialModel.findByIdAndRemove(fruitSpecialID);
        return deletedFruitSpecial;
    }
}
