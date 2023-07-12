import { CustomersService } from "@modules/customers/customers.service";
import { CreateCustomerDto } from "@modules/customers/dtos/create-сustomer.dto";
import { UpdateUserDto } from "@modules/customers/dtos/update-customer.dto";
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
    Query,
    Res,
} from "@nestjs/common";

@Controller("customer")
export class CustomersController {
    constructor(private readonly customersService: CustomersService) {}

    @Post("/create")
    async addCustomer(
        @Res() res: any,
        @Body() createUserDto: CreateCustomerDto
    ) {
        const customer = await this.customersService.createCustomer(
            createUserDto
        );
        return res.status(HttpStatus.OK).json({
            message: "Customer has been created successfully",
            customer,
        });
    }

    @Get()
    async getAllCustomer(@Res() res: any) {
        const customers = await this.customersService.getAllCustomer();
        return res.status(HttpStatus.OK).json(customers);
    }

    @Get(":userID")
    async getCustomer(@Res() res: any, @Param("userID") userID: string) {
        const customer = await this.customersService.getCustomer(userID);
        if (!customer) throw new NotFoundException("Customer does not exist!");
        return res.status(HttpStatus.OK).json(customer);
    }

    @Patch("/update")
    async updateCustomer(
        @Res() res,
        @Query("userID") userID,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const customer = await this.customersService.updateCustomer(
            userID,
            updateUserDto
        );
        if (!customer) throw new NotFoundException("Customer does not exist!");
        return res.status(HttpStatus.OK).json({
            message: "Customer has been successfully updated",
            customer,
        });
    }

    @Delete("/delete")
    async deleteCustomer(@Res() res: any, @Query("userID") userID: string) {
        const customer = await this.customersService.deleteCustomer(userID);
        if (!customer) throw new NotFoundException("Customer does not exist");
        return res.status(HttpStatus.OK).json({
            message: "Customer has been deleted",
            customer,
        });
    }
}
