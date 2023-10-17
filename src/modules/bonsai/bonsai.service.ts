import { CreateBonsaiDto } from "@modules/bonsai/dtos/create-bonsai.dto";
import { UpdateBonsaiDto } from "@modules/bonsai/dtos/update-bonsai.dto";
import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BonsaiImage } from "@schemas/bonsai_image.schema";
import { Bonsai } from "@schemas/bonsai_tree.schema";
import { Gardener } from "@schemas/garden.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Express } from "express";
import { BonsaiImageRepositoryInterface } from "interfaces/bonsai-image-repository.interface";
import { BonsaiRepositoryInterface } from "interfaces/bonsai-repository.interface";
import { Model } from "mongoose";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class BonsaiService {
    constructor(
        @InjectModel(Bonsai.name)
        private bonsaiModel: Model<Bonsai>,
        @Inject("BonsaiRepositoryInterface")
        private bonsaiRepository: BonsaiRepositoryInterface,
        @Inject("BonsaiImageRepositoryInterface")
        private bonsaiImageRepository: BonsaiImageRepositoryInterface,
        @InjectModel(Gardener.name)
        private gardenerModel: Model<Gardener>,
        private cloudinaryService: CloudinaryService
    ) {}

    async createBonsai(
        createBonsaiDto: CreateBonsaiDto,
        gardens: Gardener,
        images?: Express.Multer.File[]
    ): Promise<Response> {
        try {
            let newImages: BonsaiImage[] = [];

            const createBonsai = await this.bonsaiModel.create({
                ...createBonsaiDto,
                gardens: gardens,
            });

            if (images || images.length > 0) {
                newImages = await Promise.all(
                    images.map(async (image) => {
                        try {
                            const { url, public_id } =
                                await this.cloudinaryService.uploadFile(image);
                            return this.bonsaiImageRepository.create({
                                url,
                                public_id,
                                bonsai: createBonsai,
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
                { $push: { bonsai: createBonsai._id } }
            );

            await this.bonsaiRepository.update(createBonsai._id.toString(), {
                bonsai_images: [...newImages],
            });

            return {
                ...httpResponse.CREATE_NEW_BONSAI_SUCCESSFULLY,
            };
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException(
                    "Bonsai already exists",
                    HttpStatus.CONFLICT
                );
            }
            throw error;
        }
    }

    async getAllBonsai(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const bonsaiSpecial = await this.bonsaiRepository.findAll(
            filterObject,
            {
                ...options,
                populate: ["bonsai_images", "gardens"],
            }
        );

        if (!bonsaiSpecial) {
            throw new HttpException(
                "There are no bonsai existed yet",
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_ALL_BONSAI_SUCCESSFULLY,
            data: bonsaiSpecial,
        };
    }

    async getBonsaiById(bonsaiID: string): Promise<Response> {
        const bonsai = await this.bonsaiRepository.findOneById(bonsaiID, null, {
            populate: ["bonsai_images", "gardens"],
        });
        if (!bonsai) {
            throw new HttpException(
                "The bonsai is not existed",
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_BONSAI_SUCCESSFULLY,
            data: bonsai,
        };
    }

    async updateBonsai(
        bonsaiID: string,
        updateBonsaiDto: UpdateBonsaiDto,
        userID: string
    ): Promise<Response> {
        const isBonsaiExisted = await this.bonsaiRepository.findOneById(
            bonsaiID
        );

        if (!isBonsaiExisted) {
            throw new HttpException(
                `Can not find the fruit with this id ${bonsaiID}`,
                HttpStatus.NOT_FOUND
            );
        }

        if (isBonsaiExisted.gardens._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
            );
        }

        const updateBonsai = await this.bonsaiRepository.update(bonsaiID, {
            ...updateBonsaiDto,
        });

        return {
            ...httpResponse.UPDATE_BONSAI_SUCCESSFULLY,
            data: updateBonsai,
        };
    }

    async deleteBonsai(bonsaiID: string, userId: string): Promise<Response> {
        const bonsai = await this.bonsaiRepository.findOneById(bonsaiID);

        if (!bonsai) {
            throw new HttpException(
                `The bonsai not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (bonsai.gardens._id.toString() !== userId) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
            );
        }

        if (bonsai.bonsai_images) {
            if (
                Array.isArray(bonsai.bonsai_images) &&
                bonsai.bonsai_images.length > 0
            ) {
                for (const image of bonsai.bonsai_images) {
                    await this.bonsaiImageRepository.softDelete(
                        image._id.toString()
                    );
                }
            } else {
                return;
            }
        }

        await this.bonsaiRepository.softDelete(bonsai._id.toString());

        await this.gardenerModel.updateOne(
            { bonsai: bonsaiID },
            { $pull: { bonsai: bonsaiID } }
        );

        return httpResponse.DELETE_BONSAI_SUCCESSFULLY;
    }

    async addBonsaiImage(
        bonsaiId: string,
        userID: string,
        images: Express.Multer.File[]
    ) {
        const bonsai = await this.bonsaiRepository.findOneById(bonsaiId);
        if (!bonsai) {
            throw new HttpException(
                "Can not find the bonsai",
                HttpStatus.NOT_FOUND
            );
        }

        if (bonsai.gardens._id.toString() !== userID) {
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
                    return this.bonsaiImageRepository.create({
                        url,
                        public_id,
                        bonsai: bonsai._id,
                    });
                } catch (error) {
                    throw new HttpException(
                        "Error processing images",
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
                }
            })
        );

        const updateImageBonsai = await this.bonsaiRepository.update(
            bonsai._id.toString(),
            {
                bonsai_images: [...bonsai.bonsai_images, ...uploadedImages],
            }
        );
        return {
            ...httpResponse.UPDATE_BONSAI_IMAGE_SUCCESSFULLY,
            data: updateImageBonsai,
        };
    }

    async updateBonsaiImage(
        oldImageId: string,
        userID: string,
        newImage: Express.Multer.File
    ): Promise<Response> {
        const listImage: BonsaiImage[] = [];
        const oldImage = await this.bonsaiImageRepository.findOneById(
            oldImageId
        );
        if (!oldImage) {
            throw new HttpException(
                "The image not existed",
                HttpStatus.NOT_FOUND
            );
        }

        const bonsai = await this.bonsaiRepository.findOneById(oldImage.bonsai);
        if (!bonsai) {
            throw new HttpException(
                "Associated bonsai not found",
                HttpStatus.NOT_FOUND
            );
        }

        if (bonsai.gardens._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
            );
        }

        const { url, public_id } = await this.cloudinaryService.uploadFile(
            newImage
        );
        const newBonsaiImage = await this.bonsaiImageRepository.create({
            url,
            public_id,
            bonsai: bonsai._id,
        });
        for (const image of bonsai.bonsai_images) {
            if (image._id.toString() === oldImageId) {
                await this.bonsaiImageRepository.softDelete(
                    image._id.toString()
                );
                listImage.push(newBonsaiImage);
            } else {
                listImage.push(image);
            }
        }

        const updateBonsai = await this.bonsaiRepository.update(
            bonsai._id.toString(),
            {
                bonsai_images: listImage,
            }
        );

        return {
            ...httpResponse.UPDATE_BONSAI_IMAGE_SUCCESSFULLY,
            data: updateBonsai,
        };
    }

    async deleteBonsaiImages(
        bonsaiID: string,
        userID: string,
        imageIDs: string[]
    ): Promise<Response> {
        if (!imageIDs || imageIDs.length === 0) {
            throw new HttpException(
                "No image IDs provided",
                HttpStatus.BAD_REQUEST
            );
        }

        const bonsai = await this.bonsaiRepository.findOneById(bonsaiID);

        if (!bonsai) {
            throw new HttpException(
                `The bonsai with ID ${bonsaiID} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (bonsai.gardens._id.toString() !== userID) {
            throw new HttpException(
                "You don't have permission",
                HttpStatus.FORBIDDEN
            );
        }

        bonsai.bonsai_images = bonsai.bonsai_images.filter(
            (image) => !imageIDs.includes(image._id.toString())
        );

        await Promise.all(
            imageIDs.map((id) => this.bonsaiImageRepository.softDelete(id))
        );

        await this.bonsaiRepository.update(bonsaiID, {
            bonsai_images: bonsai.bonsai_images,
        });

        return httpResponse.DELETE_BONSAI_IMAGES_SUCCESSFULLY;
    }
}
