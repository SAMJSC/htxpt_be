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

@Controller("special-fruit")
export class SpecialFruitController {
    constructor(private readonly specialFruitService: SpecialFruitService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FilesInterceptor("images"))
    async addFruitSpecial(
        @Body() createFruitSpecialDto: CreateFruitSpecialDto,
        @UserDecorator() garden: Gardener,
        @UploadedFiles() image?: Express.Multer.File[]
    ): Promise<Response> {
        return await this.specialFruitService.createFruitSpecial(
            createFruitSpecialDto,
            garden,
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
            limit: Number(query.limit) || 99999,
            offset: Number(query.offset) || 0,
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

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Patch("/:fruitSpecialID")
    async updateFruitSpecial(
        @Param("fruitSpecialID") fruitSpecialID: string,
        @UserDecorator() user: Gardener,
        @Body() updateFruitSpecial: UpdateFruitSpecialDto
    ): Promise<Response> {
        return await this.specialFruitService.updateFruitSpecial(
            fruitSpecialID,
            user._id.toString(),
            updateFruitSpecial
        );
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Delete("/:fruitSpecialID")
    async deleteFruitSpecial(
        @Param("fruitSpecialID") fruitSpecialID: string,
        @UserDecorator() user: Gardener
    ): Promise<Response> {
        return await this.specialFruitService.deleteFruitSpecial(
            fruitSpecialID,
            user._id.toString()
        );
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Post("/image")
    @UseInterceptors(FilesInterceptor("images"))
    async addFruitImages(
        @Param("fruitID") fruitID: string,
        @UserDecorator() user: Gardener,
        @UploadedFiles() images?: Express.Multer.File[]
    ): Promise<Response> {
        return await this.specialFruitService.addFruitImage(
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
        return await this.specialFruitService.updateFruitImage(
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
        return await this.specialFruitService.deleteFruitImages(
            fruitID,
            user._id.toString(),
            imageIDs
        );
    }
}
