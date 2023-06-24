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
    findAll() {
        return this.gardensService.findAll();
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
