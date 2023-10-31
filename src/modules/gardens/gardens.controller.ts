import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { UpdateGardenDto } from "@modules/gardens/dtos/update-gardens.dto";
import { GardensService } from "@modules/gardens/gardens.service";
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
import { Admin } from "@schemas/admin.schema";
import { Customer } from "@schemas/customer.schema";
import { Gardener } from "@schemas/garden.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-user.decorator";
import { Roles } from "decorators/roles.decorator";
import { Express } from "express";
import { PaginationOptions } from "types/common.type";

@Controller("gardeners")
export class GardensController {
    constructor(private readonly gardensService: GardensService) {}

    @Get(":gardenerID")
    async getGardenByID(
        @Param("gardenerID") gardenerID: string
    ): Promise<Response> {
        const gardener = await this.gardensService.getGardenById(gardenerID);
        return gardener;
    }

    @Get()
    findAll(@Query() query: any): Promise<Response> {
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

        return this.gardensService.getAllGardener(filterObject, options);
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.GARDENER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    @Patch(":gardenerId")
    updateGarden(
        @Param("gardenerId") gardenerId: string,
        @Body() newGardenInfoDto: UpdateGardenDto,
        @UserDecorator() user: Gardener | Customer | Admin
    ): Promise<Response> {
        return this.gardensService.updateGarden(
            user._id.toString(),
            user.role,
            gardenerId,
            newGardenInfoDto
        );
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
    @Delete(":gardenerId")
    remove(@Param("gardenerId") gardenerId: string): Promise<Response> {
        return this.gardensService.deleteGarden(gardenerId);
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.GARDENER)
    @Post("upload/avatar")
    @UseInterceptors(FileInterceptor("avatar"))
    uploadAvatar(
        @UploadedFile() image: Express.Multer.File,
        @UserDecorator() user: Gardener | Customer | Admin
    ): Promise<Response> {
        return this.gardensService.handleAvatar(user._id.toString(), image);
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.GARDENER)
    @Delete("delete/avatar")
    deleteAvatar(
        @UserDecorator() user: Gardener | Customer | Admin
    ): Promise<Response> {
        return this.gardensService.deleteAvatar(user._id.toString());
    }
}
