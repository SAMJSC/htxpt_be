import { CreateUserDto } from "@modules/users/dtos/create-user.dto";
import { UpdateUserDto } from "@modules/users/dtos/update-user.dto";
import { UsersService } from "@modules/users/users.service";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
} from "@nestjs/common";
import { User } from "schemas/users.schema";

@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    async getAllUser(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get("/:id")
    async find(@Param("id") id: string) {
        return await this.usersService.findOne(id);
    }

    @Post()
    async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.usersService.create(createUserDto);
    }

    @Patch(":id")
    async update(
        @Param("id") id: string,
        @Body() updateTodoDto: UpdateUserDto
    ) {
        return await this.usersService.update(id, updateTodoDto);
    }

    @Delete(":id")
    async delete(@Param("id") id: string) {
        return await this.usersService.delete(id);
    }
}
