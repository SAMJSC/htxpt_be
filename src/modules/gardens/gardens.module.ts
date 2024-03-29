import { CloudinaryModule } from "@modules/cloudinary/cloudinary.module";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminSchema } from "@schemas/admin.schema";
import { Customer, CustomerSchema } from "@schemas/customer.schema";
import { Fruit, FruitSchema } from "@schemas/fruit.schema";
import {
    GardenerAvatar,
    GardenerAvatarSchema,
} from "@schemas/gardener_avatars.schema";
import { Admin } from "mongodb";
import { AdminRepository } from "repository/admin.repository";
import { CustomerRepository } from "repository/customer.repository";
import { GardenerAvatarRepository } from "repository/gardener-avatar.repository";
import { GardensRepository } from "repository/gardens.repository";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "schemas/device_session.schema";
import { Gardener, GardenerSchema } from "schemas/garden.schema";

import { GardensController } from "./gardens.controller";
import { GardensService } from "./gardens.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Gardener.name, schema: GardenerSchema },
            { name: DeviceSession.name, schema: DeviceSessionSchema },
            { name: Fruit.name, schema: FruitSchema },
            { name: Admin.name, schema: AdminSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: GardenerAvatar.name, schema: GardenerAvatarSchema },
        ]),
        CloudinaryModule,
        CacheModule.register(),
    ],
    controllers: [GardensController],
    providers: [
        GardensService,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
        {
            provide: "CustomerRepositoryInterface",
            useClass: CustomerRepository,
        },
        { provide: "AdminRepositoryInterface", useClass: AdminRepository },
        {
            provide: "GardenerAvatarRepositoryInterface",
            useClass: GardenerAvatarRepository,
        },
    ],
    exports: [GardensService, "GardenerAvatarRepositoryInterface"],
})
export class GardensModule {}
