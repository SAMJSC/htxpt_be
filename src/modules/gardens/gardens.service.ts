import { USER_ROLES } from "@constants/common.constants";
import { GardenerRegistrationDto } from "@modules/auth/dtos/garden-registration.dto";
import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { UpdateGardenDto } from "@modules/gardens/dtos/update-gardens.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Fruit } from "@schemas/fruit.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Cache } from "cache-manager";
import { Express } from "express";
import { AdminRepositoryInterface } from "interfaces/admin-repository.interface";
import { CustomerRepositoryInterface } from "interfaces/customer-repository.interface";
import { GardenerAvatarRepositoryInterface } from "interfaces/gardener-avatars-repository";
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
        @Inject("CustomerRepositoryInterface")
        private readonly customerRepository: CustomerRepositoryInterface,
        @Inject("AdminRepositoryInterface")
        private readonly adminRepository: AdminRepositoryInterface,
        @Inject("GardenerAvatarRepositoryInterface")
        private readonly gardenerAvatarRepository: GardenerAvatarRepositoryInterface,
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>,
        @InjectModel(Fruit.name)
        private readonly fruitModel: Model<Fruit>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private cloudinaryService: CloudinaryService
    ) {
        super(gardenRepository);
    }

    async checkExistence(fields: { email?: string; phone?: string }) {
        const services = [
            this.gardenRepository,
            this.adminRepository,
            this.customerRepository,
        ];

        const fieldNames = ["email", "user_name", "phone"];

        for (const service of services) {
            for (const fieldName of fieldNames) {
                if (!fields[fieldName]) continue;

                const existingEntity = await service.findOneByCondition({
                    [fieldName]: fields[fieldName],
                });

                if (existingEntity) {
                    throw new HttpException(
                        `${
                            fieldName.charAt(0).toUpperCase() +
                            fieldName.slice(1)
                        } already exists!!`,
                        HttpStatus.CONFLICT
                    );
                }
            }
        }
    }

    async getGardenById(gardenerID: string): Promise<Response> {
        const gardener = await this.gardenRepository.findOneById(
            gardenerID,
            null,
            { populate: ["fruits", "bonsai", "special_fruits"] }
        );
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
            data: gardeners,
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
                    HttpStatus.FORBIDDEN
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

        const { email, phone } = updateGardenDto;

        await this.checkExistence({ email, phone });

        if (email) {
            const isEmailVerified = await this.cacheManager.get(
                `verified-${email}`
            );
            if (!isEmailVerified) {
                throw new HttpException(
                    "Email must be verified before updating",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        if (phone) {
            const isPhoneVerified = await this.cacheManager.get(
                `verified-${phone}`
            );
            if (!isPhoneVerified) {
                throw new HttpException(
                    "Phone number must be verified before updating",
                    HttpStatus.BAD_REQUEST
                );
            }
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

    async handleAvatar(
        userId: string,
        image: Express.Multer.File
    ): Promise<Response> {
        try {
            const gardener = await this.gardenRepository.findOneById(userId);
            if (!gardener) {
                throw new HttpException(
                    `Gardener with ID ${userId} not found.`,
                    HttpStatus.NOT_FOUND
                );
            }

            const { public_id, url } = await this.cloudinaryService.uploadFile(
                image
            );

            if (gardener.avatar) {
                await this.gardenerAvatarRepository.update(gardener.avatar, {
                    url,
                    public_id,
                    gardener: gardener.id.toString(),
                });
                return { ...httpResponse.UPDATE_AVATAR_SUCCESSFULLY };
            } else {
                const newAvatar = await this.gardenerAvatarRepository.create({
                    url,
                    public_id,
                    gardener,
                });
                await this.gardenRepository.update(gardener._id.toString(), {
                    avatar: newAvatar._id.toString(),
                });
                return { ...httpResponse.CREATE_NEW_AVATAR_SUCCESSFULLY };
            }
        } catch (error) {
            throw new HttpException(
                "Failed to handle avatar.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async deleteAvatar(userId: string): Promise<Response> {
        try {
            const gardener = await this.gardenRepository.findOneById(userId);
            if (!gardener) {
                throw new HttpException(
                    `Gardener with ID ${userId} not found.`,
                    HttpStatus.NOT_FOUND
                );
            }

            if (gardener.avatar) {
                await this.gardenRepository.update(gardener._id.toString(), {
                    avatar: null,
                });
                return { ...httpResponse.AVATAR_DELETED_SUCCESSFULLY };
            } else {
                throw new HttpException(
                    `No avatar found for gardener with ID ${userId}.`,
                    HttpStatus.NOT_FOUND
                );
            }
        } catch (error) {
            throw new HttpException(
                "Failed to delete avatar.",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
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

        await this.fruitModel.deleteMany({
            gardens: gardenToDelete._id,
        });

        await this.gardenerAvatarRepository.softDelete(gardenToDelete.avatar);

        await this.gardenRepository.permanentlyDelete(
            gardenToDelete._id.toString()
        );

        return {
            ...httpResponse.DELETE_GARDENER_SUCCESSFULLY,
        };
    }
}
