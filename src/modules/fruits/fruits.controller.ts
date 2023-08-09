import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { CreateFruitSpecialDto } from "@modules/fruits/dtos/create-fruit-special.dto";
import { CreateFruitsDto } from "@modules/fruits/dtos/create-fruits.dto";
import { UpdateFruitSpecialDto } from "@modules/fruits/dtos/update-fruit-special.dto";
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
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Gardener } from "@schemas/garden.schema";
import { UserDecorator } from "decorators/current-garden.decorator";
import { Roles } from "decorators/roles.decorator";
import { Express } from "express";

@Controller("fruit")
export class FruitsController {
    constructor(private readonly fruitsService: FruitsService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FileInterceptor("fruit_images"))
    async addFruit(
        @Res() res: any,
        @Body() createFruitDto: CreateFruitsDto,
        @UserDecorator() garden: Gardener,
        @UploadedFile() image?: Express.Multer.File
    ) {
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

        const fruit = await this.fruitsService.createFruit(
            parsedDto,
            garden._id.toString(),
            image
        );
        return res.status(HttpStatus.OK).json({
            message: "fruit has been created successfully",
            fruit,
        });
    }

    @Post("/create-special")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    async addFruitSpecial(
        @Res() res: any,
        @Body() createFruitSpecialDto: CreateFruitSpecialDto,
        @UserDecorator() garden: Gardener
    ) {
        const fruitSpecial = await this.fruitsService.createFruitSpecial(
            createFruitSpecialDto,
            garden._id.toString()
        );
        return res.status(HttpStatus.OK).json({
            message: "fruit has been created successfully",
            fruitSpecial,
        });
    }

    @Get()
    async getAllFruit(@Res() res: any) {
        const fruits = await this.fruitsService.getAllFruit();
        return res.status(HttpStatus.OK).json(fruits);
    }

    @Get("/special")
    async getAllFruitSpecial(@Res() res: any) {
        const fruitSpecial = await this.fruitsService.getAllFruitSpecial();
        return res.status(HttpStatus.OK).json(fruitSpecial);
    }

    @Get(":fruitID")
    async getFruitById(@Res() res: any, @Param("fruitID") fruitID: string) {
        const fruit = await this.fruitsService.getFruitsById(fruitID);
        if (!fruit) throw new NotFoundException("fruit does not exist!");
        return res.status(HttpStatus.OK).json(fruit);
    }

    @Get("/special/:fruitSpecialID")
    async getFruitSpecialById(
        @Res() res: any,
        @Param("fruitSpecialID") fruitSpecialID: string
    ) {
        const fruitSpecial = await this.fruitsService.getFruitSpecialById(
            fruitSpecialID
        );
        if (!fruitSpecial)
            throw new NotFoundException("fruit Special does not exist!");
        return res.status(HttpStatus.OK).json(fruitSpecial);
    }

    @Patch("/update/:fruitID")
    @UseInterceptors(FileInterceptor("image"))
    async updateFruit(
        @Res() res,
        @Param("fruitID") fruitID: string,
        @Body() UpdateFruits: UpdateFruitsDto,
        @UploadedFile() image?: Express.Multer.File
    ) {
        const fruit = await this.fruitsService.updateFruits(
            fruitID,
            UpdateFruits,
            image
        );
        if (!fruit) throw new NotFoundException("fruit does not exist!");
        return res.status(HttpStatus.OK).json({
            message: "fruit has been successfully updated",
            fruit,
        });
    }

    @Patch("/update/special/:fruitSpecialID")
    async updateFruitSpecial(
        @Res() res,
        @Param("fruitSpecialID") fruitSpecialID: string,
        @Body() updateFruitSpecial: UpdateFruitSpecialDto
    ) {
        const fruitSpecial = await this.fruitsService.updateFruitSpecial(
            fruitSpecialID,
            updateFruitSpecial
        );
        if (!fruitSpecial)
            throw new NotFoundException("fruit Special does not exist!");
        return res.status(HttpStatus.OK).json({
            message: "fruit Special has been successfully updated",
            fruitSpecial,
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

    @Delete("/delete/special/:fruitSpecialID")
    async deleteFruitSpecial(
        @Res() res: any,
        @Param("fruitSpecialID") fruitSpecialID: string
    ) {
        const fruitSpecial = await this.fruitsService.deleteFruitSpecial(
            fruitSpecialID
        );
        if (!fruitSpecial)
            throw new NotFoundException("fruit Special does not exist");
        return res.status(HttpStatus.OK).json({
            message: "fruit has been deleted",
            fruitSpecial,
        });
    }
}
