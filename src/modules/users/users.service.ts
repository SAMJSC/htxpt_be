import { CreateUserDto } from "@modules/users/dtos/create-user.dto";
import { UpdateUserDto } from "@modules/users/dtos/update-user.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "Schemas/users.schema";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<User> {
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

    async getAllCustomer(): Promise<User[]> {
        const customers = await this.userModel.find().exec();
        return customers;
    }

    async getCustomer(userID: string): Promise<User> {
        return await this.userModel.findById(userID).exec();
    }

    async updateCustomer(userID, updateUserDto: UpdateUserDto): Promise<User> {
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
