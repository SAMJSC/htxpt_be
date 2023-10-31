import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { CreateFruitsDto } from "@modules/fruits/dtos/create-fruits.dto";
import { UpdateFruitsDto } from "@modules/fruits/dtos/update-fruits.dto";
import { HttpService } from "@nestjs/axios";
import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Fruit } from "@schemas/fruit.schema";
import {
    FruitCategory,
    FruitCategoryDocument,
} from "@schemas/fruit_category.chema";
import { FruitImage } from "@schemas/fruit_image.schema";
import { Gardener } from "@schemas/garden.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Express } from "express";
import { FruitImageRepositoryInterface } from "interfaces/fruit-image-repository.interface";
import { FruitsRepositoryInterface } from "interfaces/fruits-repository.interface";
import { Model } from "mongoose";
import { firstValueFrom } from "rxjs";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class FruitsService {
    private readonly logger = new Logger(FruitsService.name);
    constructor(
        @InjectModel(Fruit.name)
        private fruitModel: Model<Fruit>,
        @InjectModel(FruitCategory.name)
        private readonly fruitCategoryModel: Model<FruitCategoryDocument>,
        private cloudinaryService: CloudinaryService,
        @Inject("FruitImageRepositoryInterface")
        private readonly fruitImageRepository: FruitImageRepositoryInterface,
        @Inject("FruitCategoryRepositoryInterface")
        private readonly fruitCategoryRepository: FruitImageRepositoryInterface,
        @Inject("FruitRepositoryInterface")
        private readonly fruitRepository: FruitsRepositoryInterface,
        @InjectModel(Gardener.name)
        private gardenerModel: Model<Gardener>,
        private readonly httpService: HttpService
    ) {}

    async checkImage(imageUrls: string[]): Promise<any> {
        const requestBody = {
            image_urls: imageUrls,
        };

        try {
            const { data } = await firstValueFrom(
                this.httpService.post<any>(
                    "https://8771-2001-ee0-4041-9a81-d8ab-aab6-13bd-1e8.ngrok-free.app/upload",
                    requestBody
                )
            );
            return data;
        } catch (error: any) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.includes("ERR_NGROK_3200")
            ) {
                return {
                    status: "offline",
                    message: "Ngrok server is not live",
                };
            } else {
                this.logger.error(error.response.data);
                throw new HttpException(
                    "An error happened while validating the image",
                    HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async createImage(image: Express.Multer.File, fruit: any) {
        const { url, public_id } = await this.cloudinaryService.uploadFile(
            image
        );
        const validationResult = await this.checkImage([url]);

        if (validationResult.status && validationResult.status === "offline") {
            return this.fruitImageRepository.create({
                url: url,
                public_id,
                fruit,
            });
        } else if (
            validationResult.result &&
            validationResult.result[0] !== 1
        ) {
            return;
        } else {
            return this.fruitImageRepository.create({
                url: validationResult.image_urls[0],
                public_id,
                fruit,
            });
        }
    }

    async createFruit(
        createFruitDto: CreateFruitsDto,
        gardens: Gardener,
        images?: Express.Multer.File[]
    ): Promise<Response> {
        const isFruitCategoryExisted =
            await this.fruitCategoryRepository.findOneByCondition({
                category_name: createFruitDto.fruit_category_name,
            });

        if (!isFruitCategoryExisted) {
            throw new HttpException(
                "This fruit category doesn't existed yet",
                HttpStatus.BAD_REQUEST
            );
        }

        const isGardenerFruitExisted =
            await this.fruitRepository.findOneByCondition({
                gardens: gardens,
                fruit_categories: isFruitCategoryExisted._id,
            });

        const newImages = images
            ? await Promise.all(
                  images.map((image) =>
                      this.createImage(image, isGardenerFruitExisted)
                  )
              )
            : [];

        if (newImages.includes(undefined)) {
            throw new HttpException(
                "Some images failed validation",
                HttpStatus.BAD_REQUEST
            );
        }

        if (isGardenerFruitExisted) {
            await this.fruitModel.findByIdAndUpdate(
                isGardenerFruitExisted._id,
                {
                    fruit_name: createFruitDto.fruit_name,
                    gardens: gardens,
                    quantity:
                        isGardenerFruitExisted.quantity +
                        createFruitDto.quantity,
                    fruit_categories: isGardenerFruitExisted.fruit_categories,
                    fruit_images: [
                        ...isGardenerFruitExisted.fruit_images,
                        ...newImages,
                    ],
                }
            );

            return httpResponse.UPDATE_FRUIT_IMAGE_SUCCESSFULLY;
        } else {
            const createFruit = new this.fruitModel({
                fruit_name: createFruitDto.fruit_name,
                quantity: createFruitDto.quantity,
                gardens: gardens,
                fruit_categories: isFruitCategoryExisted,
                fruit_images: newImages,
            });
            await createFruit.save();
            await this.gardenerModel.updateOne(
                { _id: gardens._id },
                { $push: { fruits: createFruit._id } }
            );

            return httpResponse.CREATE_NEW_FRUIT_SUCCESSFULLY;
        }
    }

    async getAllFruit(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const fruits = await this.fruitRepository.findAllWithSubFields(
            filterObject,
            {
                ...options,
                populate: ["gardens", "fruit_categories", "fruit_images"],
            }
        );

        return {
            ...httpResponse.GET_ALL_FRUIT_SUCCESSFULLY,
            data: fruits,
        };
    }

    async getFruitsById(fruitID: string): Promise<Response> {
        const fruit = await this.fruitRepository.findOneById(fruitID, null, {
            populate: ["gardens", "fruit_categories", "fruit_images"],
        });
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
        userID: string,
        updateFruitsDto: UpdateFruitsDto
    ): Promise<Response> {
        const fruit = await this.fruitRepository.findOneById(fruitID);

        if (!fruit) {
            throw new HttpException(
                `Can not find the fruit with this id ${fruitID}`,
                HttpStatus.NOT_FOUND
            );
        }

        if (fruit._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
            );
        }

        const updatedFruit = await this.fruitRepository.update(fruitID, {
            ...updateFruitsDto,
        });

        return {
            ...httpResponse.UPDATE_FRUIT_SUCCESSFULLY,
            data: updatedFruit,
        };
    }

    async deleteFruits(fruitID: string, userID: string): Promise<Response> {
        const fruit = await this.fruitModel.findById(fruitID);

        if (!fruit) {
            throw new HttpException(
                `Fruit with ID ${fruitID} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (fruit._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
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

        await this.fruitRepository.softDelete(fruit._id.toString());

        await this.gardenerModel.updateOne(
            { fruits: fruitID },
            { $pull: { fruits: fruitID } }
        );
        return httpResponse.DELETE_FRUIT_SUCCESSFULLY;
    }

    async addFruitImage(
        fruitID: string,
        userID: string,
        images: Express.Multer.File[]
    ): Promise<Response> {
        const fruit = await this.fruitRepository.findOneById(fruitID);

        if (!fruit) {
            throw new HttpException(
                "The fruit doesn't existed",
                HttpStatus.NOT_FOUND
            );
        }

        if (fruit.gardens._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
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

        const updatedImageFruit = await this.fruitRepository.update(
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
        userID: string,
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

        const fruit = await this.fruitRepository.findOneById(oldImage.fruit);
        if (!fruit) {
            throw new HttpException(
                "Associated fruit not found",
                HttpStatus.NOT_FOUND
            );
        }

        if (fruit._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
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

        const updateFruit = await this.fruitRepository.update(
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
        userID: string,
        imageIDs: string[]
    ): Promise<Response> {
        if (!imageIDs || imageIDs.length === 0) {
            throw new HttpException(
                "No image IDs provided",
                HttpStatus.NOT_FOUND
            );
        }

        const fruit = await this.fruitRepository.findOneById(fruitID);
        if (!fruit) {
            throw new HttpException(
                `Fruit with ID ${fruitID} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (fruit._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
            );
        }

        fruit.fruit_images = fruit.fruit_images.filter(
            (image) => !imageIDs.includes(image._id.toString())
        );

        await Promise.all(
            imageIDs.map((id) => this.fruitImageRepository.softDelete(id))
        );

        await this.fruitRepository.update(fruitID, {
            fruit_images: fruit.fruit_images,
        });

        return httpResponse.DELETE_FRUIT_IMAGE_SUCCESSFULLY;
    }
}
