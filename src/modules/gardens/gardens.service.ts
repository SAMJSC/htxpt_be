import { USER_ROLES } from "@constants/common.constants";
import { GardenRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { UpdateGardenDto } from "@modules/gardens/dtos/update-gardens.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GardensRepositoryInterface } from "interfaces/gardens-repository.interface";
import mongoose, { Model } from "mongoose";
import { DeviceSession } from "schemas/device_session.schema";
import { Garden } from "schemas/garden.schema";
import { BaseServiceAbstract } from "services/base.abstract.service";

@Injectable()
export class GardensService extends BaseServiceAbstract<Garden> {
    constructor(
        @Inject("GardensRepositoryInterface")
        private readonly gardenRepository: GardensRepositoryInterface,
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>
    ) {
        super(gardenRepository);
    }

    async createGarden(
        createGardenDto: GardenRegistrationDto
    ): Promise<Garden> {
        return this.gardenRepository.create({
            ...createGardenDto,
            role: USER_ROLES.GARDENER,
        });
    }

    async getGardenByEmail(email: string): Promise<Garden> {
        try {
            const garden = await this.gardenRepository.findOneByCondition({
                email,
            });
            if (!garden) {
                throw new HttpException(
                    `The garden with email ${email} doesn't existed `,
                    HttpStatus.NOT_FOUND
                );
            }
            return garden;
        } catch (error) {
            throw new HttpException(
                error.message,
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateUser(
        id: string,
        updateGardenDto: UpdateGardenDto
    ): Promise<Garden> {
        const user = await this.gardenRepository.findOneById(id);
        if (!user) {
            throw new HttpException(
                `User with id ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        Object.assign(user, updateGardenDto);
        await this.gardenRepository.create(user);
        return user;
    }

    async deleteGarden(id: string) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new HttpException(
                "Invalid garden ID",
                HttpStatus.BAD_REQUEST
            );
        }

        const gardenToDelete = await this.gardenRepository.findOneById(id);
        if (!gardenToDelete) {
            throw new HttpException("Garden not found", HttpStatus.NOT_FOUND);
        }

        await this.deviceSessionModel.deleteMany({
            garden: gardenToDelete._id,
        });
        const result = await this.gardenRepository.permanentlyDelete(
            gardenToDelete._id.toString()
        );
        return result;
    }
}
