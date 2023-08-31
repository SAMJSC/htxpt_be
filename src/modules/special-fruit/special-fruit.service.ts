import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { CreateFruitSpecialDto } from "@modules/special-fruit/dtos/create-fruit-special.dto";
import { UpdateFruitSpecialDto } from "@modules/special-fruit/dtos/update-fruit-special.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FruitImage } from "@schemas/fruit_image.schema";
import { Gardener } from "@schemas/garden.schema";
import { SpecialFruit } from "@schemas/special_fruit.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Express } from "express";
import { FruitImageRepositoryInterface } from "interfaces/fruit-image-repository.interface";
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
        @Inject("FruitImageRepositoryInterface")
        private readonly fruitImageRepository: FruitImageRepositoryInterface,
        @Inject("SpecialFruitRepositoryInterface")
        private readonly fruitSpecialRepository: SpecialFruitsRepositoryInterface,
        @InjectModel(Gardener.name)
        private gardenerModel: Model<Gardener>
    ) {}

    async createFruitSpecial(
        createFruitDto: CreateFruitSpecialDto,
        gardens: Gardener,
        images?: Express.Multer.File[]
    ): Promise<Response> {
        let newImages: FruitImage[] = [];

        const createFruit = await this.fruitSpecialModel.create({
            ...createFruitDto,
            gardens: gardens,
        });

        if (images || images.length > 0) {
            newImages = await Promise.all(
                images.map(async (image) => {
                    try {
                        const { url, public_id } =
                            await this.cloudinaryService.uploadFile(image);
                        return this.fruitImageRepository.create({
                            url,
                            public_id,
                            fruit: createFruit._id,
                        });
                    } catch (error) {
                        throw new HttpException(
                            "Error processing images",
                            HttpStatus.INTERNAL_SERVER_ERROR
                        );
                    }
                })
            );
        }

        await this.gardenerModel.updateOne(
            { _id: gardens._id },
            { $push: { special_fruits: createFruit._id } }
        );

        await this.fruitSpecialRepository.update(createFruit._id.toString(), {
            fruit_images: [...newImages],
        });

        return httpResponse.CREATE_NEW_FRUIT_SUCCESSFULLY;
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
        const fruit = await this.fruitSpecialRepository.findOneById(
            fruitSpecialID,
            null,
            { populate: ["fruit_images"] }
        );
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
        updateFruitSpecialDto: UpdateFruitSpecialDto
    ): Promise<Response> {
        const isFruitExisted = await this.fruitSpecialRepository.findOneById(
            fruitSpecialID
        );

        if (!isFruitExisted) {
            throw new HttpException(
                `Can not find the fruit with this id ${fruitSpecialID}`,
                HttpStatus.NOT_FOUND
            );
        }

        const updateFruit = await this.fruitSpecialRepository.update(
            fruitSpecialID,
            { ...updateFruitSpecialDto }
        );

        return {
            ...httpResponse.UPDATE_FRUIT_SUCCESSFULLY,
            data: updateFruit,
        };
    }

    async deleteFruitSpecial(fruitSpecialID: string): Promise<Response> {
        const fruit = await this.fruitSpecialRepository.findOneById(
            fruitSpecialID
        );

        if (!fruit) {
            throw new HttpException(
                `Fruit with id ${fruitSpecialID} doesn't existed`,
                HttpStatus.NOT_FOUND
            );
        }

        if (fruit.fruit_images) {
            if (
                Array.isArray(fruit.fruit_images) &&
                fruit.fruit_images.length > 0
            ) {
                for (const image of fruit.fruit_images) {
                    await this.fruitImageRepository.softDelete(
                        image._id.toString()
                    );
                }
            } else {
                return;
            }
        }

        await this.fruitSpecialRepository.softDelete(fruit._id.toString());

        await this.gardenerModel.updateOne(
            { fruits: fruitSpecialID },
            {
                $pull: { fruits: fruitSpecialID },
            }
        );
        return httpResponse.DELETE_FRUIT_SUCCESSFULLY;
    }

    async addFruitImage(
        fruitID: string,
        images: Express.Multer.File[]
    ): Promise<Response> {
        const fruit = await this.fruitSpecialRepository.findOneById(fruitID);

        if (!fruit) {
            throw new HttpException(
                "The fruit doesn't existed",
                HttpStatus.NOT_FOUND
            );
        }

        if (!images || images.length <= 0) {
            throw new HttpException(
                "There are no media at all",
                HttpStatus.BAD_REQUEST
            );
        }

        const uploadedImages = await Promise.all(
            images.map(async (image) => {
                try {
                    const { url, public_id } =
                        await this.cloudinaryService.uploadFile(image);
                    return this.fruitImageRepository.create({
                        url,
                        public_id,
                        fruit: fruit._id,
                    });
                } catch (error) {
                    throw new HttpException(
                        "Error processing images",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            })
        );

        const updatedImageFruit = await this.fruitSpecialRepository.update(
            fruit._id.toString(),
            {
                fruit_images: [...fruit.fruit_images, ...uploadedImages],
            }
        );

        return {
            ...httpResponse.UPDATE_FRUIT_IMAGE_SUCCESSFULLY,
            data: updatedImageFruit,
        };
    }

    async updateFruitImage(
        oldImageId: string,
        newImage: Express.Multer.File
    ): Promise<Response> {
        const oldImage = await this.fruitImageRepository.findOneById(
            oldImageId
        );
        if (!oldImage) {
            throw new HttpException(
                "The image not existed",
                HttpStatus.NOT_FOUND
            );
        }

        const fruit = await this.fruitSpecialRepository.findOneById(
            oldImage.fruit
        );
        if (!fruit) {
            throw new HttpException(
                "Associated fruit not found",
                HttpStatus.NOT_FOUND
            );
        }

        const { url, public_id } = await this.cloudinaryService.uploadFile(
            newImage
        );

        const newFruitImage = await this.fruitImageRepository.create({
            url,
            public_id,
            fruit: fruit._id,
        });

        const listImage = fruit.fruit_images.map((image: FruitImage) =>
            image._id.toString() === oldImageId ? newFruitImage._id : image
        ) as FruitImage[];

        await this.fruitImageRepository.softDelete(oldImageId);

        const updateFruit = await this.fruitSpecialRepository.update(
            fruit._id.toString(),
            {
                fruit_images: listImage,
            }
        );

        return {
            ...httpResponse.UPDATE_FRUIT_IMAGE_SUCCESSFULLY,
            data: updateFruit,
        };
    }

    async deleteFruitImages(
        fruitID: string,
        imageIDs: string[]
    ): Promise<Response> {
        if (!imageIDs || imageIDs.length === 0) {
            throw new HttpException(
                "No image IDs provided",
                HttpStatus.NOT_FOUND
            );
        }

        const fruit = await this.fruitSpecialRepository.findOneById(fruitID);
        if (!fruit) {
            throw new HttpException(
                `Fruit with ID ${fruitID} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        fruit.fruit_images = fruit.fruit_images.filter(
            (image) => !imageIDs.includes(image._id.toString())
        );

        await Promise.all(
            imageIDs.map((id) => this.fruitImageRepository.softDelete(id))
        );

        await this.fruitSpecialRepository.update(fruitID, {
            fruit_images: fruit.fruit_images,
        });

        return httpResponse.DELETE_FRUIT_IMAGE_SUCCESSFULLY;
    }
}
