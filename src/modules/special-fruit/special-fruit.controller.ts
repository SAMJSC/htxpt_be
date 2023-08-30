import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { CreateFruitSpecialDto } from "@modules/special-fruit/dtos/create-fruit-special.dto";
import { UpdateFruitSpecialDto } from "@modules/special-fruit/dtos/update-fruit-special.dto";
import { SpecialFruitService } from "@modules/special-fruit/special-fruit.service";
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

@Controller("special-fruit")
export class SpecialFruitController {
    constructor(private readonly specialFruitService: SpecialFruitService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FileInterceptor("fruit_images"))
    async addFruitSpecial(
        @Body() createFruitSpecialDto: CreateFruitSpecialDto,
        @UserDecorator() garden: Gardener,
        @UploadedFile() image?: Express.Multer.File
    ): Promise<Response> {
        const {
            fruit_name,
            quantity,
            fruit_images,
            range_price,
            shape,
            dimeter,
            weight,
        } = createFruitSpecialDto;

        const parsedDto = {
            fruit_name,
            quantity: Number(quantity),
            fruit_images,
            range_price: JSON.parse(`[${range_price}]`),
            shape: JSON.parse(`[${shape}]`),
            dimeter: JSON.parse(`[${dimeter}]`),
            weight: JSON.parse(`[${weight}]`),
        };
        return await this.specialFruitService.createFruitSpecial(
            parsedDto,
            garden._id.toString(),
            image
        );
    }

    @Get()
    async getAllFruitSpecial(@Query() query: any): Promise<Response> {
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
        return await this.specialFruitService.getAllFruitSpecial(
            filterObject,
            options
        );
    }

    @Get("/:fruitSpecialID")
    async getFruitSpecialById(
        @Param("fruitSpecialID") fruitSpecialID: string
    ): Promise<Response> {
        return await this.specialFruitService.getFruitSpecialById(
            fruitSpecialID
        );
    }

    @Patch("/:fruitSpecialID")
    @UseInterceptors(FileInterceptor("image"))
    async updateFruitSpecial(
        @Param("fruitSpecialID") fruitSpecialID: string,
        @Body() updateFruitSpecial: UpdateFruitSpecialDto,
        @UploadedFile() image?: Express.Multer.File
    ): Promise<Response> {
        return await this.specialFruitService.updateFruitSpecial(
            fruitSpecialID,
            updateFruitSpecial,
            image
        );
    }

    @Delete("/:fruitSpecialID")
    async deleteFruitSpecial(
        @Param("fruitSpecialID") fruitSpecialID: string
    ): Promise<Response> {
        return await this.specialFruitService.deleteFruitSpecial(
            fruitSpecialID
        );
    }
}
