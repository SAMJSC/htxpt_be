import { CreateProductDto } from "@modules/products/dtos/create-product.dto";
import { ProductsService } from "@modules/products/products.service";
import { Body, Controller, Get, Post } from "@nestjs/common";
import { Product } from "schemas/products.schema";

@Controller("products")
export class ProductsController {
    constructor(private readonly usersService: ProductsService) {}

    @Get()
    async getAllUser(): Promise<Product[]> {
        return this.usersService.findAll();
    }

    @Post()
    async createUser(
        @Body() createUserDto: CreateProductDto
    ): Promise<Product> {
        return this.usersService.create(createUserDto);
    }
}
