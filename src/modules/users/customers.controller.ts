import { UsersService } from "@modules/users/customers.service";
import { CreateCustomerDto } from "@modules/users/dtos/create-сustomer.dto";
import { UpdateUserDto } from "@modules/users/dtos/update-customer.dto";
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
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post("/create")
    async addCustomer(
        @Res() res: any,
        @Body() createUserDto: CreateCustomerDto
    ) {
        const customer = await this.usersService.createUser(createUserDto);
        return res.status(HttpStatus.OK).json({
            message: "Customer has been created successfully",
            customer,
        });
    }

    @Get()
    async getAllCustomer(@Res() res: any) {
        const customers = await this.usersService.getAllCustomer();
        return res.status(HttpStatus.OK).json(customers);
    }

    @Get(":userID")
    async getCustomer(@Res() res: any, @Param("userID") userID: string) {
        const customer = await this.usersService.getCustomer(userID);
        if (!customer) throw new NotFoundException("Customer does not exist!");
        return res.status(HttpStatus.OK).json(customer);
    }

    @Patch("/update")
    async updateCustomer(
        @Res() res,
        @Query("userID") userID,
        @Body() updateUserDto: UpdateUserDto
    ) {
        const customer = await this.usersService.updateCustomer(
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
        const customer = await this.usersService.deleteCustomer(userID);
        if (!customer) throw new NotFoundException("Customer does not exist");
        return res.status(HttpStatus.OK).json({
            message: "Customer has been deleted",
            customer,
        });
    }
}
