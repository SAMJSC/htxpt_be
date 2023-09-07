import { CustomersController as CustomersController } from "@modules/customers/customers.controller";
import { CustomersService as CustomersService } from "@modules/customers/customers.service";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminSchema } from "@schemas/admin.schema";
import { Gardener, GardenerSchema } from "@schemas/garden.schema";
import { Admin } from "mongodb";
import { AdminRepository } from "repository/admin.repository";
import { CustomerRepository } from "repository/customer.repository";
import { GardensRepository } from "repository/gardens.repository";
import { Customer, CustomerSchema } from "schemas/customer.schema";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "schemas/device_session.schema";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Customer.name, schema: CustomerSchema },
            { name: Gardener.name, schema: GardenerSchema },
            { name: DeviceSession.name, schema: DeviceSessionSchema },
            { name: Admin.name, schema: AdminSchema },
        ]),
        CacheModule.register(),
    ],
    controllers: [CustomersController],
    providers: [
        CustomersService,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
        {
            provide: "CustomerRepositoryInterface",
            useClass: CustomerRepository,
        },
        { provide: "AdminRepositoryInterface", useClass: AdminRepository },
    ],
    exports: [CustomersService],
})
export class CustomersModule {}
