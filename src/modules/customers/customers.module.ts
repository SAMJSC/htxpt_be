import { CustomersController as CustomersController } from "@modules/customers/customers.controller";
import { CustomersService as CustomersService } from "@modules/customers/customers.service";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CustomerRepository } from "repository/customer.repository";
import { Customer, CustomerSchema } from "schemas/customer.schema";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "schemas/device_session.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: DeviceSession.name, schema: DeviceSessionSchema },
        ]),
    ],
    controllers: [CustomersController],
    providers: [
        CustomersService,
        {
            provide: "CustomerRepositoryInterface",
            useClass: CustomerRepository,
        },
    ],
    exports: [CustomersService],
})
export class CustomersModule {}
