import { CreateCustomerDto } from "@modules/customers/dtos/create-сustomer.dto";
import { UpdateUserDto as UpdateCustomerDto } from "@modules/customers/dtos/update-customer.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Customer } from "schemas/customer.schema";

@Injectable()
export class CustomersService {
    constructor(
        @InjectModel(Customer.name)
        private customerModel: Model<Customer>
    ) {}

    async createCustomer(
        createCustomerDto: CreateCustomerDto
    ): Promise<Customer> {
        try {
            const createCustomer = new this.customerModel(createCustomerDto);
            return await createCustomer.save();
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
        const customers = await this.customerModel.find().exec();
        return customers;
    }

    async getCustomer(customerID: string): Promise<Customer> {
        return await this.customerModel.findById(customerID).exec();
    }

    async updateCustomer(
        customerID,
        updateCustomerDto: UpdateCustomerDto
    ): Promise<Customer> {
        const updatedCustomer = await this.customerModel.findByIdAndUpdate(
            customerID,
            updateCustomerDto,
            { new: true }
        );
        return updatedCustomer;
    }

    async deleteCustomer(customerID: string): Promise<any> {
        const deletedCustomer = await this.customerModel.findByIdAndRemove(
            customerID
        );
        return deletedCustomer;
    }
}
