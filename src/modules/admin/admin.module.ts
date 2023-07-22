import { AdminController } from "@modules/admin/admin.controller";
import { AdminService } from "@modules/admin/admin.service";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Admin, AdminSchema } from "@schemas/admin.schema";
import {
    DeviceSession,
    DeviceSessionSchema,
} from "@schemas/device_session.schema";
import { AdminRepository } from "repository/admin.repository";

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Admin.name, schema: AdminSchema },
            { name: DeviceSession.name, schema: DeviceSessionSchema },
        ]),
        CacheModule.register(),
    ],
    controllers: [AdminController],
    providers: [
        AdminService,
        { provide: "AdminRepositoryInterface", useClass: AdminRepository },
    ],
    exports: [AdminService],
})
export class AdminModule {}
