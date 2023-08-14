import { USER_ROLES } from "@constants/common.constants";
import { GardenerRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { UpdateGardenDto } from "@modules/gardens/dtos/update-gardens.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { GardenerRepositoryInterface } from "interfaces/gardens-repository.interface";
import mongoose, { Model } from "mongoose";
import { DeviceSession } from "schemas/device_session.schema";
import { Gardener } from "schemas/garden.schema";
import { BaseServiceAbstract } from "services/base.abstract.service";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class GardensService extends BaseServiceAbstract<Gardener> {
    constructor(
        @Inject("GardensRepositoryInterface")
        private readonly gardenRepository: GardenerRepositoryInterface,
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>
    ) {
        super(gardenRepository);
    }

    async getGardenById(gardenerID: string): Promise<Response> {
        const gardener = await this.gardenRepository.findOneById(gardenerID);
        if (!gardener) {
            throw new HttpException(
                `The gardener with id ${gardenerID} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_GARDENER_BY_ID_SUCCESSFULLY,
            data: {
                gardener,
            },
        };
    }

    async getAllGardener(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const gardeners = await this.gardenRepository.findAll(
            filterObject,
            options
        );
        return {
            ...httpResponse.GET_ALL_GARDENERS_SUCCESSFULLY,
            data: {
                gardeners,
            },
        };
    }

    async createGarden(
        createGardenerDto: GardenerRegistrationDto
    ): Promise<Gardener> {
        return this.gardenRepository.create({
            ...createGardenerDto,
            role: USER_ROLES.GARDENER,
        });
    }

    async getGardenByEmail(email: string): Promise<Gardener> {
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

    async updateGarden(
        actionUserId: string,
        actionUserRole: USER_ROLES,
        gardenId: string,
        updateGardenDto: UpdateGardenDto
    ): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(gardenId)) {
            throw new HttpException(
                `The id ${gardenId} is not valid`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (actionUserRole === USER_ROLES.GARDENER) {
            if (actionUserId !== gardenId) {
                throw new HttpException(
                    "You can not have permission",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        const garden = await this.gardenRepository.findOneById(gardenId);
        if (!garden) {
            throw new HttpException(
                `Garden with id ${gardenId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        Object.assign(garden, updateGardenDto);
        await this.gardenRepository.update(gardenId, garden);

        return {
            ...httpResponse.UPDATE_GARDENER_SUCCESSFULLY,
            data: {
                garden,
            },
        };
    }

    async deleteGarden(gardenerId: string): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(gardenerId)) {
            throw new HttpException(
                "Invalid garden ID",
                HttpStatus.BAD_REQUEST
            );
        }

        const gardenToDelete = await this.gardenRepository.findOneById(
            gardenerId
        );
        if (!gardenToDelete) {
            throw new HttpException("Garden not found", HttpStatus.NOT_FOUND);
        }

        await this.deviceSessionModel.deleteMany({
            garden: gardenToDelete._id,
        });

        await this.gardenRepository.permanentlyDelete(
            gardenToDelete._id.toString()
        );

        return {
            ...httpResponse.DELETE_GARDENER_SUCCESSFULLY,
        };
    }
}
