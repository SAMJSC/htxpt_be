import { AuthService } from "@modules/auth/auth.service";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { GardensRepository } from "repository/gardens.repository";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "schemas/device_session.schema";
import { Garden, GardensSchema } from "schemas/garden.schema";

import { GardensController } from "./gardens.controller";
import { GardensService } from "./gardens.service";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Garden.name, schema: GardensSchema },
            { name: DeviceSession.name, schema: DeviceSessionSchema },
        ]),
        CacheModule.register(),
    ],
    controllers: [GardensController],
    providers: [
        GardensService,
        AuthService,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
    ],
    exports: [GardensService, AuthService],
})
export class GardensModule {}
