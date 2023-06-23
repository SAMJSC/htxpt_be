import { CreateUserDto } from "@modules/users/dtos/create-user.dto";
import { UpdateUserDto } from "@modules/users/dtos/update-user.dto";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "schemas/users.schema";

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
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

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findOne(id: string): Promise<User> {
        return await this.userModel.findById(id).exec();
    }

    async update(id: string, updateTodoDto: UpdateUserDto): Promise<User> {
        return await this.userModel.findByIdAndUpdate(id, updateTodoDto).exec();
    }

    async delete(id: string): Promise<User> {
        return await this.userModel.findByIdAndDelete(id).exec();
    }
}
