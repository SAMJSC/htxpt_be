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
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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
    @UseInterceptors(FileInterceptor("fruit_images"))
    async addFruit(
        @Body() createFruitDto: CreateFruitsDto,
        @UserDecorator() garden: Gardener,
        @UploadedFile() image?: Express.Multer.File
    ): Promise<Response> {
        const parsedDto: CreateFruitsDto = {
            fruit_name: createFruitDto.fruit_name,
            fruit_category_name: createFruitDto.fruit_category_name,
            fruit_categories: createFruitDto.fruit_categories,
            quantity: Number(createFruitDto.quantity),
            fruit_category_quantity: Number(
                createFruitDto.fruit_category_quantity
            ),
            fruit_images: createFruitDto.fruit_images,
            range_price: JSON.parse(`[${createFruitDto.range_price}]`),
            shape: JSON.parse(`[${createFruitDto.shape}]`),
            dimeter: JSON.parse(`[${createFruitDto.dimeter}]`),
            weight: JSON.parse(`[${createFruitDto.weight}]`),
        };

        return await this.fruitsService.createFruit(
            parsedDto,
            garden._id.toString(),
            image
        );
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
            limit: Number(query.limit) || 10,
            skip: Number(query.skip) || 0,
        };

        return await this.fruitsService.getAllFruit(filterObject, options);
    }

    @Get(":fruitID")
    async getFruitById(@Param("fruitID") fruitID: string): Promise<Response> {
        return await this.fruitsService.getFruitsById(fruitID);
    }

    @Patch("/:fruitID")
    @UseInterceptors(FileInterceptor("image"))
    async updateFruit(
        @Param("fruitID") fruitID: string,
        @Body() updateFruits: UpdateFruitsDto,
        @UploadedFile() image?: Express.Multer.File
    ): Promise<Response> {
        return await this.fruitsService.updateFruits(
            fruitID,
            updateFruits,
            image
        );
    }

    @Delete("/:fruitID")
    async deleteFruit(@Param("fruitID") fruitID: string): Promise<Response> {
        return await this.fruitsService.deleteFruits(fruitID);
    }
}
