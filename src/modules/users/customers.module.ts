import { UsersController as CustomersController } from "@modules/users/customers.controller";
import { UsersService as CustomersService } from "@modules/users/customers.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Customer, CustomerSchema } from "schemas/customer.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
        ]),
    ],
    controllers: [CustomersController],
    exports: [CustomersService],
    providers: [CustomersService],
})
export class CustomersModule {}
