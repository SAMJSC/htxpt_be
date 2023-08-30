import { CreateBonsaiDto } from "@modules/bonsai/dtos/create-bonsai.dto";
import { UpdateBonsaiDto } from "@modules/bonsai/dtos/update-bonsai.dto";
import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
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
            let newImages: any[] = [];

            if (!images || images.length <= 0) {
                throw new HttpException(
                    "There are no media at all",
                    HttpStatus.BAD_REQUEST
                );
            }

            const createBonsai = await this.bonsaiModel.create({
                ...createBonsaiDto,
                gardens: gardens,
            });

            for (const image of images) {
                const uploadImage = await this.cloudinaryService.uploadFile(
                    image
                );
                const newImage = await this.bonsaiImageRepository.create({
                    url: uploadImage.url,
                    public_id: uploadImage.public_id,
                    bonsai: createBonsai._id,
                });
                newImages = [...newImages, newImage];
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
        updateBonsaiDto: UpdateBonsaiDto
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

        await this.bonsaiModel.findByIdAndUpdate(bonsaiID, {
            ...updateBonsaiDto,
        });

        const bonsai = await this.bonsaiRepository.findOneById(bonsaiID);

        return {
            ...httpResponse.UPDATE_BONSAI_SUCCESSFULLY,
            data: bonsai,
        };
    }

    async deleteBonsai(bonsaiID: string): Promise<Response> {
        const bonsai = await this.bonsaiRepository.findOneById(bonsaiID);

        if (!bonsai) {
            throw new HttpException(
                `The bonsai not found`,
                HttpStatus.NOT_FOUND
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

    async addBonsaiImage(bonsaiId: string, images: Express.Multer.File[]) {
        const bonsai = await this.bonsaiRepository.findOneById(bonsaiId);
        if (!bonsai) {
            throw new HttpException(
                "Can not find the bonsai",
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
                    return this.bonsaiImageRepository.create({
                        url,
                        public_id,
                        bonsai: bonsai.id,
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

    async updateBonsaiImage(oldImageId: string, newImage: Express.Multer.File) {
        const listImage: any[] = [];
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
                listImage.push(newBonsaiImage._id);
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

    async deleteBonsaiImage(imageID: string): Promise<Response> {
        const listImage: any[] = [];
        const image = await this.bonsaiImageRepository.findOneById(imageID);
        if (!image) {
            throw new HttpException(
                "The image not existed",
                HttpStatus.NOT_FOUND
            );
        }
        const bonsai = await this.bonsaiRepository.findOneById(image.bonsai);
        for (const image of bonsai.bonsai_images) {
            if (image._id.toString() === imageID) {
                await this.bonsaiImageRepository.softDelete(
                    image._id.toString()
                );
            } else {
                listImage.push(image);
            }
        }
        await this.bonsaiRepository.update(bonsai._id.toString(), {
            bonsai_images: [...listImage],
        });

        return httpResponse.DELETE_BONSAI_IMAGE_SUCCESSFULLY;
    }

    async deleteBonsaiImages(imageIDs: string[]): Promise<Response> {
        if (!imageIDs || imageIDs.length === 0) {
            throw new HttpException(
                "No image IDs provided",
                HttpStatus.BAD_REQUEST
            );
        }

        const bonsaisToUpdate = new Map<string, Bonsai>();

        for (const imageID of imageIDs) {
            const image = await this.bonsaiImageRepository.findOneById(imageID);
            if (!image) {
                throw new HttpException(
                    `Image with ID ${imageID} not found`,
                    HttpStatus.NOT_FOUND
                );
            }

            const bonsai = await this.bonsaiRepository.findOneById(
                image.bonsai
            );
            if (!bonsai) continue;

            if (!bonsaisToUpdate.has(bonsai._id.toString())) {
                bonsaisToUpdate.set(bonsai._id.toString(), {
                    ...bonsai,
                    bonsai_images: bonsai.bonsai_images.filter(
                        (img) => img._id.toString() !== imageID
                    ),
                });
            } else {
                const updatedBonsai = bonsaisToUpdate.get(
                    bonsai._id.toString()
                );
                updatedBonsai.bonsai_images =
                    updatedBonsai.bonsai_images.filter(
                        (img) => img._id.toString() !== imageID
                    );
                bonsaisToUpdate.set(bonsai._id.toString(), updatedBonsai);
            }

            await this.bonsaiImageRepository.softDelete(imageID);
        }

        for (const [bonsaiID, updatedBonsai] of bonsaisToUpdate.entries()) {
            await this.bonsaiRepository.update(bonsaiID, {
                bonsai_images: updatedBonsai.bonsai_images,
            });
        }

        return httpResponse.DELETE_BONSAI_IMAGES_SUCCESSFULLY;
    }
}
