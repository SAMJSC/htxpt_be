import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { CreateFruitsDto } from "@modules/fruits/dtos/create-fruits.dto";
import { UpdateFruitsDto } from "@modules/fruits/dtos/update-fruits.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Fruit } from "@schemas/fruit.schema";
import {
    FruitCategory,
    FruitCategoryDocument,
} from "@schemas/fruit_category.chema";
import { FruitImage } from "@schemas/fruit_image.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Express } from "express";
import { FruitsRepositoryInterface } from "interfaces/fruits-repository.interface";
import { Model } from "mongoose";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class FruitsService {
    constructor(
        @InjectModel(Fruit.name)
        private fruitModel: Model<Fruit>,
        @InjectModel(FruitCategory.name)
        private readonly fruitCategoryModel: Model<FruitCategoryDocument>,
        private cloudinaryService: CloudinaryService,
        @InjectModel(FruitImage.name)
        private fruitImage: Model<FruitImage>,
        @Inject("FruitRepositoryInterface")
        private readonly fruitRepository: FruitsRepositoryInterface
    ) {}

    async createFruit(
        createFruitDto: CreateFruitsDto,
        gardens: any,
        image?: Express.Multer.File
    ): Promise<Response> {
        try {
            let newImage: any;
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
                return httpResponse.CREATE_NEW_FRUIT_SUCCESSFULLY;
            } else {
                const createFruit = new this.fruitModel({
                    fruit_name: createFruitDto.fruit_name,
                    quantity: createFruitDto.quantity,
                    gardens: gardens,
                    fruit_categories: isFruitCategoryName,
                    fruit_images: [newImageId],
                });
                await createFruit.save();
                return httpResponse.CREATE_NEW_FRUIT_SUCCESSFULLY;
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

    async getAllFruit(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const fruits = await this.fruitRepository.findAll(filterObject, {
            ...options,
            populate: ["fruit_categories", "fruit_images"],
        });

        return {
            ...httpResponse.GET_ALL_FRUIT_SUCCESSFULLY,
            data: fruits,
        };
    }

    async getFruitsById(fruitID: string): Promise<Response> {
        const fruit = await this.fruitModel
            .findById(fruitID)
            .populate(["fruit_categories", "fruit_images"])
            .exec();
        if (!fruit) {
            throw new HttpException(
                `Cannot find the fruit with the ID: ${fruitID}`,
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_FRUIT_BY_ID_SUCCESSFULLY,
            data: fruit,
        };
    }

    async updateFruits(
        fruitID: string,
        updateFruitsDto: UpdateFruitsDto,
        image?: Express.Multer.File
    ): Promise<Response> {
        let newImage: any;

        const isFruitExisted = await this.fruitRepository.findOneById(fruitID);

        if (!isFruitExisted) {
            throw new HttpException(
                `Can not find the fruit with this id ${fruitID}`,
                HttpStatus.NOT_FOUND
            );
        }
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
        return {
            ...httpResponse.UPDATE_FRUIT_SUCCESSFULLY,
            data: fruitNew,
        };
    }

    async deleteFruits(fruitID: string): Promise<Response> {
        const fruit = await this.fruitModel.findById(fruitID);
        const fruitImage = await this.fruitImage.findById(fruit.fruit_images);

        if (fruit) {
            await this.cloudinaryService.deleteFile(fruitImage.public_id);

            await this.fruitImage.findByIdAndRemove(fruit.fruit_images);
            await this.fruitModel.findByIdAndRemove(fruitID);

            return httpResponse.DELETE_FRUIT_SUCCESSFULLY;
        } else {
            throw new HttpException(
                `Fruit with ID ${fruitID} not found`,
                HttpStatus.NOT_FOUND
            );
        }
    }
}
