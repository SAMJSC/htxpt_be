import { CreateBonsaiDto } from "@modules/bonsai/dtos/create-bonsai.dto";
import { UpdateBonsaiDto } from "@modules/bonsai/dtos/update-bonsai.dto";
import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BonsaiImage } from "@schemas/bonsai_image.schema";
import { Bonsai } from "@schemas/bonsai_tree.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Express } from "express";
import { Model } from "mongoose";

@Injectable()
export class BonsaiService {
    constructor(
        @InjectModel(Bonsai.name)
        private bonsaiModel: Model<Bonsai>,
        @InjectModel(BonsaiImage.name)
        private bonsaiImage: Model<BonsaiImage>,
        private cloudinaryService: CloudinaryService
    ) {}

    async createBonsai(
        createBonsaiDto: CreateBonsaiDto,
        gardens: any,
        image?: Express.Multer.File
    ): Promise<Response> {
        try {
            let newImage;
            if (image) {
                const uploadResult = await this.cloudinaryService.uploadFile(
                    image
                );
                newImage = new this.bonsaiImage({
                    url: uploadResult.url,
                    public_id: uploadResult.public_id,
                });
                await newImage.save();
            }
            const newImageId = newImage ? newImage._id : null;

            const createBonsai = new this.bonsaiModel({
                ...createBonsaiDto,
                gardens: gardens,
                bonsai_images: [newImageId],
            });
            await createBonsai.save();
            return {
                ...httpResponse.CREATE_NEW_BONSAI_SUCCESSFULLY,
                data: createBonsai,
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
    async getAllBonsai(): Promise<Bonsai[]> {
        const bonsaiSpecial = await this.bonsaiModel.find().exec();
        return bonsaiSpecial;
    }

    async getBonsaiById(bonsaiID: string): Promise<Bonsai> {
        return await this.bonsaiModel.findById(bonsaiID).exec();
    }

    async updateBonsai(
        bonsaiID: string,
        updateBonsaiDto: UpdateBonsaiDto,
        image?: Express.Multer.File
    ): Promise<Response> {
        let newImage;
        if (image) {
            const uploadResult = await this.cloudinaryService.uploadFile(image);
            newImage = new this.bonsaiImage({
                url: uploadResult.url,
                public_id: uploadResult.public_id,
            });
            await newImage.save();
        }

        const newImageId = newImage ? newImage._id : null;
        const bonsaiById = await this.bonsaiModel.findById(bonsaiID).exec();

        const updatedBonsai = await this.bonsaiModel.findByIdAndUpdate(
            bonsaiID,
            {
                ...updateBonsaiDto,
                bonsai_images: newImageId
                    ? [newImageId]
                    : [bonsaiById.bonsai_images],
            }
        );
        return {
            ...httpResponse.UPDATE_BONSAI_SUCCESSFULLY,
            data: updatedBonsai,
        };
    }

    async deleteBonsai(bonsaiID: string): Promise<any> {
        const deletedFruitSpecial = await this.bonsaiModel.findByIdAndRemove(
            bonsaiID
        );
        return deletedFruitSpecial;
    }
}
