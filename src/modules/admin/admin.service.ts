import { USER_ROLES } from "@constants/common.constants";
import { AdminRegistrationDto } from "@modules/auth/dtos/admin-registration.dto";
import { Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Admin } from "@schemas/admin.schema";
import { DeviceSession } from "@schemas/device_session.schema";
import { AdminRepositoryInterface } from "interfaces/admin-repository.interface";
import { Model } from "mongoose";
import { BaseServiceAbstract } from "services/base.abstract.service";

@Injectable()
export class AdminService extends BaseServiceAbstract<Admin> {
    constructor(
        @Inject("AdminRepositoryInterface")
        private readonly adminRepository: AdminRepositoryInterface,
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>
    ) {
        super(adminRepository);
    }

    async createAdmin(createAdminDto: AdminRegistrationDto): Promise<Admin> {
        return this.adminRepository.create({
            ...createAdminDto,
            role: USER_ROLES.ADMIN,
        });
    }
}
