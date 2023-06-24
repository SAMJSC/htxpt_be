import { AuthService } from "@modules/auth/auth.service";
import { GardensModule } from "@modules/gardens/gardens.module";
import { GardensService } from "@modules/gardens/gardens.service";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { GardensRepository } from "repository/gardens.repository";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "schemas/device_session.schema";
import { Garden, GardensSchema } from "schemas/garden.schema";
import { JwtStrategy } from "strategegies/jwt.strategy";
import { LocalStrategy } from "strategegies/local.strategy";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: DeviceSession.name, schema: DeviceSessionSchema },
            { name: Garden.name, schema: GardensSchema },
        ]),
        CacheModule.register(),
        GardensModule,
        PassportModule,
    ],
    providers: [
        GardensService,
        AuthService,
        LocalStrategy,
        JwtStrategy,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
    ],
    exports: [AuthService],
})
export class AuthModule {}
