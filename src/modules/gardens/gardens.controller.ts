import { UpdateGardenDto } from "@modules/gardens/dtos/update-gardens.dto";
import { GardensService } from "@modules/gardens/gardens.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Patch,
    Query,
} from "@nestjs/common";
import { Garden } from "schemas/garden.schema";

@Controller("gardens")
export class GardensController {
    constructor(private readonly gardensService: GardensService) {}

    @Get(":gardenID")
    async getGardenByID(@Param("gardenID") gardenID: string): Promise<Garden> {
        try {
            const garden = await this.gardensService.findOne(gardenID);
            return garden;
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    @Get()
    findAll(@Query() query: any) {
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

        const options = {
            limit: Number(query.limit) || 10,
            skip: Number(query.skip) || 0,
        };

        return this.gardensService.findAll(filterObject, options);
    }

    @Patch(":id")
    updateUser(
        @Param("id") id: string,
        @Body() newGardenInfoDto: UpdateGardenDto
    ): Promise<Garden> {
        return this.gardensService.updateUser(id, newGardenInfoDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.gardensService.deleteGarden(id);
    }
}
