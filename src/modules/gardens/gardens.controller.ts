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
    Query,
    UseGuards,
} from "@nestjs/common";
import { Response } from "@shared/response/response.interface";
import { Roles } from "decorators/roles.decorator";
import { PaginationOptions } from "types/common.type";

@Controller("gardens")
export class GardensController {
    constructor(private readonly gardensService: GardensService) {}

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard)
    @Get(":gardenID")
    async getGardenByID(
        @Param("gardenID") gardenID: string
    ): Promise<Response> {
        const garden = await this.gardensService.getGardenById(gardenID);
        return garden;
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
        @Body() newGardenInfoDto: UpdateGardenDto
    ): Promise<Response> {
        return this.gardensService.updateGarden(gardenerId, newGardenInfoDto);
    }

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
    @Delete(":gardenerId")
    remove(@Param("gardenerId") gardenerId: string): Promise<Response> {
        return this.gardensService.deleteGarden(gardenerId);
    }
}
