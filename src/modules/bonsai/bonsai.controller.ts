import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { BonsaiService } from "@modules/bonsai/bonsai.service";
import { CreateBonsaiDto } from "@modules/bonsai/dtos/create-bonsai.dto";
import { UpdateBonsaiDto } from "@modules/bonsai/dtos/update-bonsai.dto";
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

@Controller("bonsai")
export class BonsaiController {
    constructor(private readonly bonsaiService: BonsaiService) {}

    @Post()
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FilesInterceptor("bonsai_images"))
    async addFruit(
        @Body() createBonsai: CreateBonsaiDto,
        @UserDecorator() garden: Gardener,
        @UploadedFiles() images?: Express.Multer.File[]
    ): Promise<Response> {
        const parsedDto: CreateBonsaiDto = {
            tree_name: createBonsai.tree_name,
            quantity: createBonsai.quantity,
            description: createBonsai.description,
        };

        return await this.bonsaiService.createBonsai(parsedDto, garden, images);
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

        return await this.bonsaiService.getAllBonsai(filterObject, options);
    }

    @Get(":bonsaiID")
    async getBonsaiById(
        @Param("bonsaiID") bonsaiID: string
    ): Promise<Response> {
        return await this.bonsaiService.getBonsaiById(bonsaiID);
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Patch("/:bonsaiID")
    async updateBonsai(
        @Param("bonsaiID") bonsaiID: string,
        @Body() updateBonsai: UpdateBonsaiDto,
        @UserDecorator() user: Gardener
    ) {
        return await this.bonsaiService.updateBonsai(
            bonsaiID,
            updateBonsai,
            user._id.toString()
        );
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @Delete("/:bonsaiID")
    async deleteBonsai(
        @Param("bonsaiID") bonsaiID: string,
        @UserDecorator() user: Gardener
    ) {
        return await this.bonsaiService.deleteBonsai(
            bonsaiID,
            user._id.toString()
        );
    }

    @Post("/image")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FilesInterceptor("bonsai_images"))
    async addBonsaiImage(
        @Param("bonsaiID") bonsaiId: string,
        @UserDecorator() user: Gardener,
        @UploadedFiles() images?: Express.Multer.File[]
    ): Promise<Response> {
        return await this.bonsaiService.addBonsaiImage(
            bonsaiId,
            user._id.toString(),
            images
        );
    }

    @Patch("/image/:imageID")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FileInterceptor("bonsai_image"))
    async updateBonsaiImageWithId(
        @Param("imageID") imageID: string,
        @UserDecorator() user: Gardener,
        @UploadedFile() newImage: Express.Multer.File
    ): Promise<Response> {
        return await this.bonsaiService.updateBonsaiImage(
            imageID,
            user._id.toString(),
            newImage
        );
    }

    @Delete("/images/delete/:bonsaiID")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    async deleteBonsaiImages(
        @Param("bonsaiID") bonsaiID: string,
        @UserDecorator() user: Gardener,
        @Body("imageIDs") imageIDs: string[]
    ): Promise<Response> {
        return await this.bonsaiService.deleteBonsaiImages(
            bonsaiID,
            user._id.toString(),
            imageIDs
        );
    }
}
