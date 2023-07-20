import { AdminModule } from "@modules/admin/admin.module";
import { AdminService } from "@modules/admin/admin.service";
import { AuthService } from "@modules/auth/auth.service";
import { FruitsModule } from "@modules/fruits/fruits.module";
import { GardensModule } from "@modules/gardens/gardens.module";
import { GardensService } from "@modules/gardens/gardens.service";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Admin, AdminSchema } from "@schemas/admin.schema";
import { AdminRepository } from "repository/admin.repository";
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
            { name: Admin.name, schema: AdminSchema },
        ]),
        CacheModule.register(),
        GardensModule,
        AdminModule,
        FruitsModule,
        PassportModule,
    ],
    providers: [
        GardensService,
        AdminService,
        AuthService,
        LocalStrategy,
        JwtStrategy,
        { provide: "GardensRepositoryInterface", useClass: GardensRepository },
        { provide: "AdminRepositoryInterface", useClass: AdminRepository },
    ],
    exports: [AuthService],
})
export class AuthModule {}
