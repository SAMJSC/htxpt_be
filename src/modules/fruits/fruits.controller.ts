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
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Post,
    Res,
    UseGuards,
} from "@nestjs/common";
import { Garden } from "@schemas/garden.schema";
import { GardenDecorator } from "decorators/current-garden.decorator";
import { Roles } from "decorators/roles.decorator";

@Controller("fruit")
export class FruitsController {
    constructor(private readonly fruitsService: FruitsService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    async addFruit(
        @Res() res: any,
        @Body() createFruitDto: CreateFruitsDto,
        @GardenDecorator() garden: Garden
    ) {
        const fruit = await this.fruitsService.createFruit(
            createFruitDto,
            garden._id.toString()
        );
        return res.status(HttpStatus.OK).json({
            message: "fruit has been created successfully",
            fruit,
        });
    }

    @Get()
    async getAllFruit(@Res() res: any) {
        const fruits = await this.fruitsService.getAllFruit();
        return res.status(HttpStatus.OK).json(fruits);
    }

    @Get(":fruitID")
    async getFruitById(@Res() res: any, @Param("fruitID") fruitID: string) {
        const fruit = await this.fruitsService.getFruitsById(fruitID);
        if (!fruit) throw new NotFoundException("fruit does not exist!");
        return res.status(HttpStatus.OK).json(fruit);
    }

    @Patch("/update/:fruitID")
    async updateFruit(
        @Res() res,
        @Param("fruitID") fruitID: string,
        @Body() UpdateFruits: UpdateFruitsDto
    ) {
        const fruit = await this.fruitsService.updateFruits(
            fruitID,
            UpdateFruits
        );
        if (!fruit) throw new NotFoundException("fruit does not exist!");
        return res.status(HttpStatus.OK).json({
            message: "fruit has been successfully updated",
            fruit,
        });
    }

    @Delete("/delete/:fruitID")
    async deleteFruit(@Res() res: any, @Param("fruitID") fruitID: string) {
        const fruit = await this.fruitsService.deleteFruits(fruitID);
        if (!fruit) throw new NotFoundException("fruit does not exist");
        return res.status(HttpStatus.OK).json({
            message: "fruit has been deleted",
            fruit,
        });
    }
}
