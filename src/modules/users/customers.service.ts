import { CreateCustomerDto } from "@modules/users/dtos/create-сustomer.dto";
import { UpdateUserDto } from "@modules/users/dtos/update-customer.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Customer } from "schemas/customer.schema";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(Customer.name)
        private userModel: Model<Customer>
    ) {}

    async createUser(createUserDto: CreateCustomerDto): Promise<Customer> {
        try {
            const createUser = new this.userModel(createUserDto);
            return await createUser.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new HttpException(
                    "Email already exists",
                    HttpStatus.CONFLICT
                );
            }
            throw error;
        }
    }

    async getAllCustomer(): Promise<Customer[]> {
        const customers = await this.userModel.find().exec();
        return customers;
    }

    async getCustomer(userID: string): Promise<Customer> {
        return await this.userModel.findById(userID).exec();
    }

    async updateCustomer(
        userID,
        updateUserDto: UpdateUserDto
    ): Promise<Customer> {
        const updatedCustomer = await this.userModel.findByIdAndUpdate(
            userID,
            updateUserDto,
            { new: true }
        );
        return updatedCustomer;
    }

    async deleteCustomer(customerID: string): Promise<any> {
        const deletedCustomer = await this.userModel.findByIdAndRemove(
            customerID
        );
        return deletedCustomer;
    }
}
