import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { CreateFruitSpecialDto } from "@modules/special-fruit/dtos/create-fruit-special.dto";
import { UpdateFruitSpecialDto } from "@modules/special-fruit/dtos/update-fruit-special.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FruitImage } from "@schemas/fruit_image.schema";
import { SpecialFruit } from "@schemas/special_fruit.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Express } from "express";
import { SpecialFruitsRepositoryInterface } from "interfaces/special-fruit.interface";
import { Model } from "mongoose";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class SpecialFruitService {
    constructor(
        @InjectModel(SpecialFruit.name)
        private fruitSpecialModel: Model<SpecialFruit>,
        private cloudinaryService: CloudinaryService,
        @InjectModel(FruitImage.name)
        private fruitImage: Model<FruitImage>,
        @Inject("SpecialFruitRepositoryInterface")
        private readonly fruitSpecialRepository: SpecialFruitsRepositoryInterface
    ) {}

    async createFruitSpecial(
        createFruitDto: CreateFruitSpecialDto,
        gardens: string,
        image?: Express.Multer.File
    ): Promise<Response> {
        let newImageId = null;
        if (image) {
            const uploadResult = await this.cloudinaryService.uploadFile(image);
            const newImage = new this.fruitImage({
                url: uploadResult.url,
                public_id: uploadResult.public_id,
            });

            await newImage.save();
            newImageId = newImage._id;
        }

        try {
            const {
                fruit_name,
                range_price,
                shape,
                dimeter,
                weight,
                quantity,
            } = createFruitDto;

            const createFruitSpecial = new this.fruitSpecialModel({
                fruit_name,
                range_price,
                shape,
                dimeter,
                weight,
                quantity,
                gardens,
                fruit_images: newImageId ? [newImageId] : [],
            });

            await createFruitSpecial.save();

            return httpResponse.CREATE_NEW_FRUIT_SUCCESSFULLY;
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException(
                    "Fruit special already exists",
                    HttpStatus.CONFLICT
                );
            }
            throw error;
        }
    }

    async getAllFruitSpecial(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const fruitSpecial = await this.fruitSpecialRepository.findAll(
            filterObject,
            {
                ...options,
                populate: ["fruit_images"],
            }
        );
        return {
            ...httpResponse.GET_ALL_FRUIT_SUCCESSFULLY,
            data: { fruitSpecial },
        };
    }

    async getFruitSpecialById(fruitSpecialID: string): Promise<Response> {
        const fruit = await this.fruitSpecialModel
            .findById(fruitSpecialID)
            .populate("fruit_images")
            .exec();
        if (!fruit) {
            throw new HttpException(
                `Cannot find the fruit with the ID: ${fruitSpecialID}`,
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_FRUIT_BY_ID_SUCCESSFULLY,
            data: { fruit },
        };
    }

    async updateFruitSpecial(
        fruitSpecialID: string,
        updateFruitSpecialDto: UpdateFruitSpecialDto,
        image?: Express.Multer.File
    ): Promise<Response> {
        let newImage: any;
        if (image) {
            const uploadResult = await this.cloudinaryService.uploadFile(image);
            newImage = new this.fruitImage({
                url: uploadResult.url,
                public_id: uploadResult.public_id,
            });
            await newImage.save();

            updateFruitSpecialDto.fruit_images = newImage._id;
        }

        const isFruitExisted = await this.fruitSpecialRepository.findOneById(
            fruitSpecialID
        );

        if (!isFruitExisted) {
            throw new HttpException(
                `Can not find the fruit with this id ${fruitSpecialID}`,
                HttpStatus.NOT_FOUND
            );
        }

        const updatedFruits = await this.fruitSpecialModel.findByIdAndUpdate(
            fruitSpecialID,
            updateFruitSpecialDto
        );

        const fruitNew = await this.fruitSpecialModel
            .findById(updatedFruits.id)
            .populate("fruit_images")
            .exec();
        return {
            ...httpResponse.UPDATE_FRUIT_SUCCESSFULLY,
            data: fruitNew,
        };
    }

    async deleteFruitSpecial(fruitSpecialID: string): Promise<Response> {
        await this.fruitSpecialModel.findByIdAndRemove(fruitSpecialID);
        return httpResponse.DELETE_FRUIT_SUCCESSFULLY;
    }
}
