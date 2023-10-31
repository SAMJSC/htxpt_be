import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { CreateFruitsDto } from "@modules/fruits/dtos/create-fruits.dto";
import { UpdateFruitsDto } from "@modules/fruits/dtos/update-fruits.dto";
import { FruitsService } from "@modules/fruits/fruits.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { Gardener } from "@schemas/garden.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-user.decorator";
import { Roles } from "decorators/roles.decorator";
import { Express } from "express";
import { PaginationOptions } from "types/common.type";

@Controller("fruit")
export class FruitsController {
    constructor(private readonly fruitsService: FruitsService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FilesInterceptor("fruit_images"))
    async addFruit(
        @Body() createFruitDto: CreateFruitsDto,
        @UserDecorator() garden: Gardener,
        @UploadedFiles() images?: Express.Multer.File[]
    ): Promise<Response> {
        const parsedDto: CreateFruitsDto = {
            fruit_name: createFruitDto.fruit_name,
            fruit_category_name: createFruitDto.fruit_category_name,
            quantity: Number(createFruitDto.quantity),
            range_price: JSON.parse(`[${createFruitDto.range_price}]`),
            shape: JSON.parse(`[${createFruitDto.shape}]`),
            dimeter: JSON.parse(`[${createFruitDto.dimeter}]`),
            weight: JSON.parse(`[${createFruitDto.weight}]`),
        };

        return await this.fruitsService.createFruit(parsedDto, garden, images);
    }

    @Get()
    async findAll(@Query() query: any): Promise<Response> {
        const filterObject = {};
        const operationsMap = {
            gt: "$gt",
            lt: "$lt",
            gte: "$gte",
            lte: "$lte",
            eq: "$eq",
        };

        for (const key in query) {
            if (key != "limit" && key != "skip") {
                if (
                    typeof query[key] === "object" &&
                    !Array.isArray(query[key])
                ) {
                    const operations = Object.keys(query[key]);
                    filterObject[key] = {};
                    for (const op of operations) {
                        if (operationsMap[op]) {
                            filterObject[key][operationsMap[op]] = Number(
                                query[key][op]
                            );
                        }
                    }
                } else {
                    filterObject[key] = new RegExp(query[key], "i");
                }
            }
        }

        const options: PaginationOptions = {
            limit: Number(query.limit) || 99999,
            offset: Number(query.offset) || 0,
        };

        return await this.fruitsService.getAllFruit(filterObject, options);
    }

    @Get(":fruitID")
    async getFruitById(@Param("fruitID") fruitID: string): Promise<Response> {
        return await this.fruitsService.getFruitsById(fruitID);
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Patch("/:fruitID")
    async updateFruit(
        @Param("fruitID") fruitID: string,
        @UserDecorator() user: Gardener,
        @Body() updateFruits: UpdateFruitsDto
    ): Promise<Response> {
        return await this.fruitsService.updateFruits(
            fruitID,
            user._id.toString(),
            updateFruits
        );
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Delete("/:fruitID")
    async deleteFruit(
        @Param("fruitID") fruitID: string,
        @UserDecorator() user: Gardener
    ): Promise<Response> {
        return await this.fruitsService.deleteFruits(
            fruitID,
            user._id.toString()
        );
    }

    @Post("/image/:fruitID")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FilesInterceptor("images"))
    async addFruitImages(
        @Param("fruitID") fruitID: string,
        @UserDecorator() user: Gardener,
        @UploadedFiles() images?: Express.Multer.File[]
    ): Promise<Response> {
        return await this.fruitsService.addFruitImage(
            fruitID,
            user._id.toString(),
            images
        );
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Patch("/image/:imageID")
    @UseInterceptors(FileInterceptor("images"))
    async updateFruitImageWithId(
        @Param("imageID") imageID: string,
        @UserDecorator() user: Gardener,
        @UploadedFile() newImage: Express.Multer.File
    ): Promise<Response> {
        return await this.fruitsService.updateFruitImage(
            imageID,
            user._id.toString(),
            newImage
        );
    }

    @Delete("/images/delete/:fruitID")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    async deleteFruitImages(
        @Param("fruitID") fruitID: string,
        @UserDecorator() user: Gardener,
        @Body("imageIDs") imageIDs: string[]
    ): Promise<Response> {
        return await this.fruitsService.deleteFruitImages(
            fruitID,
            user._id.toString(),
            imageIDs
        );
    }
}
