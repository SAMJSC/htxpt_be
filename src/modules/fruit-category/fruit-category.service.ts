import { CreateFruitCategoryDto } from "@modules/fruit-category/dtos/create-fruit-category.dto";
import { UpdateFruitCategoryDto } from "@modules/fruit-category/dtos/update-fruit-category.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { FruitCategory } from "@schemas/fruit_category.chema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { FruitCategoryRepositoryInterface } from "interfaces/fruit-category.interface";
import mongoose, { Model } from "mongoose";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class FruitCategoryService {
    constructor(
        @InjectModel(FruitCategory.name)
        private fruitCategoryModel: Model<FruitCategory>,
        @Inject("FruitCategoryRepositoryInterface")
        private readonly fruitCategoryRepository: FruitCategoryRepositoryInterface
    ) {}

    async getFruitCategoryByID(fruitCategoryID: string): Promise<Response> {
        const fruitCategory =
            this.fruitCategoryRepository.findOneById(fruitCategoryID);
        if (!fruitCategory) {
            throw new HttpException(
                `Cannot find the fruit category with the ID: ${fruitCategory}`,
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_FRUIT_CATEGORY_BY_ID_SUCCESSFULLY,
            data: fruitCategory,
        };
    }

    async createFruitCategory(
        createFruitCategoryDto: CreateFruitCategoryDto
    ): Promise<Response> {
        const existingFruitCategory =
            await this.fruitCategoryRepository.findOneByCondition({
                category_name: createFruitCategoryDto.category_name,
            });

        if (existingFruitCategory) {
            throw new HttpException(
                "A category with this name already exists.",
                HttpStatus.CONFLICT
            );
        }

        await this.fruitCategoryRepository.create(createFruitCategoryDto);

        return {
            ...httpResponse.CREATE_FRUIT_CATEGORY_SUCCESSFULLY,
        };
    }

    async getAllFruitCategory(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const fruitCategories = await this.fruitCategoryRepository.findAll(
            filterObject,
            options
        );

        return {
            ...httpResponse.GET_ALL_FRUIT_CATEGORY_SUCCESSFULLY,
            data: fruitCategories,
        };
    }

    async updateFruitCategory(
        fruitCategoryId: string,
        updateFruitCategoryDto: UpdateFruitCategoryDto
    ): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(fruitCategoryId)) {
            throw new HttpException(
                `The id ${fruitCategoryId} is not valid`,
                HttpStatus.BAD_REQUEST
            );
        }
        const updateFruitCategory =
            await this.fruitCategoryRepository.findOneById(fruitCategoryId);

        if (!updateFruitCategory) {
            throw new HttpException(
                "The fruit category doesn't existed",
                HttpStatus.NOT_FOUND
            );
        }
        Object.assign(updateFruitCategory, updateFruitCategoryDto);

        await this.fruitCategoryRepository.update(
            fruitCategoryId,
            updateFruitCategory
        );
        return {
            ...httpResponse.UPDATE_FRUIT_CATEGORY_SUCCESSFULLY,
            data: updateFruitCategory,
        };
    }

    async deleteFruitCategory(fruitCategoryId: string): Promise<Response> {
        const existingFruitCategory =
            await this.fruitCategoryRepository.findOneById(fruitCategoryId);

        if (!existingFruitCategory) {
            throw new HttpException(
                "The category with the given ID does not exist.",
                HttpStatus.NOT_FOUND
            );
        }

        await this.fruitCategoryRepository.permanentlyDelete(fruitCategoryId);

        return httpResponse.DELETE_FRUIT_CATEGORY_SUCCESSFULLY;
    }
}
