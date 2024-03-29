import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { CustomersService } from "@modules/customers/customers.service";
import { UpdateCustomerDto } from "@modules/customers/dtos/update-customer.dto";
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
import { Customer } from "@schemas/customer.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-user.decorator";
import { Roles } from "decorators/roles.decorator";
import { Express } from "express";
import { PaginationOptions } from "types/common.type";
@Controller("customers")
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @UseGuards(JwtAuthGuard)
    @Get(":customerID")
    async getCustomerByID(
        @Param("customerID") customerId: string
    ): Promise<Response> {
        const customer = await this.customersService.getCustomerById(
            customerId
        );
        return customer;
    }

    @UseGuards(RolesGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
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
            limit: Number(query.limit) || 99999,
            offset: Number(query.offset) || 0,
        };

        return this.customersService.getAllCustomer(filterObject, options);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.CUSTOMER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    @Patch(":customerId")
    updateCustomer(
        @Param("customerId") customerId: string,
        @Body() newCustomerInfoDto: UpdateCustomerDto,
        @UserDecorator() user: Customer
    ): Promise<Response> {
        return this.customersService.updateCustomer(
            user._id.toString(),
            user.role,
            customerId,
            newCustomerInfoDto
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
    @Delete(":customerId")
    remove(@Param("customerId") customerId: string): Promise<Response> {
        return this.customersService.deleteCustomer(customerId);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.CUSTOMER)
    @Post("favorite/:gardenerID")
    addGardenerToFavorites(
        @Param("gardenerID") gardenerID: string,
        @UserDecorator() user: Customer
    ): Promise<Response> {
        return this.customersService.addGardenerToFavorites(
            user._id.toString(),
            gardenerID
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.CUSTOMER)
    @Delete("favorite/:gardenerID")
    removeGardenerFromFavorites(
        @Param("gardenerID") gardenerID: string,
        @UserDecorator() user: Customer
    ): Promise<Response> {
        return this.customersService.removeGardenerFromFavorites(
            user._id.toString(),
            gardenerID
        );
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.CUSTOMER)
    @Get("favorites/all")
    listFavoriteGardeners(@UserDecorator() user: Customer): Promise<Response> {
        return this.customersService.listFavoriteGardeners(user._id.toString());
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.CUSTOMER)
    @Post("upload/avatar")
    @UseInterceptors(FileInterceptor("avatar"))
    uploadAvatar(
        @UploadedFile() image: Express.Multer.File,
        @UserDecorator() user: Customer
    ): Promise<Response> {
        return this.customersService.handleAvatar(user._id.toString(), image);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.CUSTOMER)
    @Delete("delete/avatar")
    deleteAvatar(@UserDecorator() user: Customer): Promise<Response> {
        return this.customersService.deleteAvatar(user._id.toString());
    }
}
