import { CustomersController as CustomersController } from "@modules/customers/customers.controller";
import { CustomersService as CustomersService } from "@modules/customers/customers.service";
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
