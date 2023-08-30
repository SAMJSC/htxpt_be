import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Fruit, FruitSchema } from "@schemas/fruit.schema";
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
        ]),
        CacheModule.register(),
    ],
    controllers: [GardensController],
    providers: [
        GardensService,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
    ],
    exports: [GardensService],
})
export class GardensModule {}
