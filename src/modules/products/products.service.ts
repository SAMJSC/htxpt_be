import { CreateProductDto } from "@modules/products/dtos/create-product.dto";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "schemas/products.schema";

@Injectable()
export class ProductsService {
    constructor(
        @InjectModel(Product.name)
        private userModel: Model<Product>
    ) {}

    async create(createUserDto: CreateProductDto): Promise<Product> {
        const createUser = new this.userModel(createUserDto);
        return await createUser.save();
    }

    async findAll(): Promise<Product[]> {
        return this.userModel.find().exec();
    }
}
