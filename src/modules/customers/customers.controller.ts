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
    Query,
    UseGuards,
} from "@nestjs/common";
import { Customer } from "@schemas/customer.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-garden.decorator";
import { Roles } from "decorators/roles.decorator";
import { PaginationOptions } from "types/common.type";
@Controller("customers")
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @UseGuards(JwtAuthGuard)
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

        return this.customersService.getAllCustomer(filterObject, options);
    }

    @UseGuards(JwtAuthGuard)
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

    @UseGuards(JwtAuthGuard)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN)
    @Delete(":customerId")
    remove(@Param("customerId") customerId: string): Promise<Response> {
        return this.customersService.deleteCustomer(customerId);
    }
}
