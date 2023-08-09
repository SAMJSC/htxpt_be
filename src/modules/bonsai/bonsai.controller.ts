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
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-garden.decorator";
import { Roles } from "decorators/roles.decorator";
import { Express } from "express";

@Controller("bonsai")
export class BonsaiController {
    constructor(private readonly bonsaiService: BonsaiService) {}

    @Post("/create")
    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.GARDENER)
    @UseInterceptors(FileInterceptor("bonsai_images"))
    async addFruit(
        // @Res() res: any,
        @Body() createBonsai: CreateBonsaiDto,
        @UserDecorator() garden: Gardener,
        @UploadedFile() image?: Express.Multer.File
    ): Promise<Response> {
        const parsedDto: CreateBonsaiDto = {
            tree_name: createBonsai.tree_name,
            quantity: createBonsai.quantity,
            description: createBonsai.description,
            bonsai_images: null,
        };

        const fruit = await this.bonsaiService.createBonsai(
            parsedDto,
            garden._id.toString(),
            image
        );
        return fruit;
    }

    @Get()
    async getAllBonsai(@Res() res: any) {
        const bonsai = await this.bonsaiService.getAllBonsai();
        return res.status(HttpStatus.OK).json(bonsai);
    }

    @Get(":bonsaiID")
    async getBonsaiById(@Res() res: any, @Param("bonsaiID") bonsaiID: string) {
        const bonsai = await this.bonsaiService.getBonsaiById(bonsaiID);
        if (!bonsai) throw new NotFoundException("Bonsai does not exist!");
        return res.status(HttpStatus.OK).json(bonsai);
    }

    @Patch("/update/:bonsaiID")
    @UseInterceptors(FileInterceptor("bonsai_images"))
    async updateBonsai(
        @Param("bonsaiID") bonsaiID: string,
        @Body() updateBonsai: UpdateBonsaiDto,
        @UploadedFile() image?: Express.Multer.File
    ) {
        const bonsai = await this.bonsaiService.updateBonsai(
            bonsaiID,
            updateBonsai,
            image
        );
        if (!bonsai) throw new NotFoundException("Bonsai does not exist!");
        return bonsai;
    }

    @Delete("/delete/:bonsaiID")
    async deleteBonsai(@Res() res: any, @Param("bonsaiID") bonsaiID: string) {
        const bonsai = await this.bonsaiService.deleteBonsai(bonsaiID);
        if (!bonsai) throw new NotFoundException("Bonsai does not exist");
        return res.status(HttpStatus.OK).json({
            message: "Bonsai has been deleted",
            bonsai,
        });
    }
}
