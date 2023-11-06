import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { CreateFruitCategoryDto } from "@modules/fruit-category/dtos/create-fruit-category.dto";
import { UpdateFruitCategoryDto } from "@modules/fruit-category/dtos/update-fruit-category.dto";
import { FruitCategoryService } from "@modules/fruit-category/fruit-category.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { Response } from "@shared/response/response.interface";
import { Roles } from "decorators/roles.decorator";
import { PaginationOptions } from "types/common.type";

@Controller("fruit-category")
export class FruitCategoryController {
    constructor(private readonly fruitCategoryService: FruitCategoryService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    async createFruitCategory(
        @Body() createFruitDto: CreateFruitCategoryDto
    ): Promise<Response> {
        return await this.fruitCategoryService.createFruitCategory(
            createFruitDto
        );
    }

    @Get()
    async getAllFruitCategory(@Query() query: any): Promise<Response> {
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
        return await this.fruitCategoryService.getAllFruitCategory(
            filterObject,
            options
        );
    }

    @Get("/:fruitCategoryID")
    async getFruitCategoryByID(
        @Param("fruitCategoryID") fruitCategoryID: string
    ): Promise<Response> {
        return await this.fruitCategoryService.getFruitCategoryByID(
            fruitCategoryID
        );
    }

    @Patch("/:fruitCategoryID")
    async updateFruitCategory(
        @Param("fruitCategoryID") fruitCategoryID: string,
        @Body() updateFruitsCategoryDto: UpdateFruitCategoryDto
    ): Promise<Response> {
        return await this.fruitCategoryService.updateFruitCategory(
            fruitCategoryID,
            updateFruitsCategoryDto
        );
    }

    @Delete("/:fruitCategoryID")
    async deleteFruitCategory(
        @Param("fruitCategoryID") fruitCategoryID: string
    ): Promise<Response> {
        return await this.fruitCategoryService.deleteFruitCategory(
            fruitCategoryID
        );
    }
}
