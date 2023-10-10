import { USER_ROLES } from "@constants/common.constants";
import { CustomerRegistrationDto } from "@modules/auth/dtos/customer-registration.dto";
import { CloudinaryService } from "@modules/cloudinary/cloudinary.service";
import { UpdateCustomerDto } from "@modules/customers/dtos/update-customer.dto";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeviceSession } from "@schemas/device_session.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { Cache } from "cache-manager";
import { Express } from "express";
import { AdminRepositoryInterface } from "interfaces/admin-repository.interface";
import { CustomerAvatarRepositoryInterface } from "interfaces/customer-avatar.repository";
import { CustomerRepositoryInterface } from "interfaces/customer-repository.interface";
import { GardenerRepositoryInterface } from "interfaces/gardens-repository.interface";
import mongoose, { Model } from "mongoose";
import { Customer } from "schemas/customer.schema";
import { BaseServiceAbstract } from "services/base.abstract.service";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class CustomersService extends BaseServiceAbstract<Customer> {
    constructor(
        @Inject("CustomerRepositoryInterface")
        private readonly customerRepository: CustomerRepositoryInterface,
        @Inject("GardensRepositoryInterface")
        private readonly gardenRepository: GardenerRepositoryInterface,
        @Inject("AdminRepositoryInterface")
        private readonly adminRepository: AdminRepositoryInterface,
        @Inject("CustomerAvatarRepositoryInterface")
        private readonly customerAvatarRepository: CustomerAvatarRepositoryInterface,
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>,
        @InjectModel(Customer.name)
        private readonly customerModel: Model<Customer>,
        @Inject(CACHE_MANAGER)
        private cacheManager: Cache,
        private cloudinaryService: CloudinaryService
    ) {
        super(customerRepository);
    }

    async checkExistence(fields: { email?: string; phone?: string }) {
        const services = [
            this.customerRepository,
            this.adminRepository,
            this.gardenRepository,
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

    async createCustomer(
        createCustomerDto: CustomerRegistrationDto
    ): Promise<Response> {
        await this.customerRepository.create({
            ...createCustomerDto,
            role: USER_ROLES.CUSTOMER,
        });
        return httpResponse.CREATE_NEW_CUSTOMER_SUCCESS;
    }

    async getCustomerById(gardenID: string): Promise<Response> {
        const customer = await this.customerRepository.findOneById(gardenID);
        if (!customer) {
            throw new HttpException(
                `The customer with id ${gardenID} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        return {
            ...httpResponse.GET_CUSTOMER_BY_ID_SUCCESSFULLY,
            data: {
                customer,
            },
        };
    }

    async getAllCustomer(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const customers = await this.customerRepository.findAll(
            filterObject,
            options
        );
        return {
            ...httpResponse.GET_ALL_CUSTOMERS_SUCCESSFULLY,
            data: {
                customers,
            },
        };
    }

    async updateCustomer(
        actionUserId: string,
        actionUserRole: USER_ROLES,
        customerId: string,
        updateCustomerDto: UpdateCustomerDto
    ): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            throw new HttpException(
                `The id ${customerId} is not valid`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (actionUserRole === USER_ROLES.CUSTOMER) {
            if (actionUserId !== customerId) {
                throw new HttpException(
                    "You can not have permission",
                    HttpStatus.BAD_REQUEST
                );
            }
        }

        const { email, phone } = updateCustomerDto;

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

        const customer = await this.customerRepository.findOneById(customerId);
        if (!customer) {
            throw new HttpException(
                `Customer with id ${customerId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        Object.assign(customer, updateCustomerDto);
        await this.customerRepository.update(customerId, customer);

        return {
            ...httpResponse.UPDATE_CUSTOMER_SUCCESSFULLY,
            data: {
                customer,
            },
        };
    }

    async deleteCustomer(customerId: string): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(customerId)) {
            throw new HttpException(
                "Invalid customer ID",
                HttpStatus.BAD_REQUEST
            );
        }

        const customerToDelete = await this.customerRepository.findOneById(
            customerId
        );
        if (!customerToDelete) {
            throw new HttpException("Customer not found", HttpStatus.NOT_FOUND);
        }

        await this.deviceSessionModel.deleteMany({
            customer: customerToDelete._id,
        });

        await this.customerRepository.permanentlyDelete(
            customerToDelete._id.toString()
        );

        return {
            ...httpResponse.DELETE_CUSTOMER_SUCCESSFULLY,
        };
    }

    async addGardenerToFavorites(
        customerId: string,
        gardenerId: string
    ): Promise<Response> {
        const customer = await this.customerRepository.findOneById(customerId);
        if (!customer) {
            throw new HttpException(
                `Customer with id ${customerId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        const gardener = await this.gardenRepository.findOneById(gardenerId);
        if (!gardener) {
            throw new HttpException(
                `Gardener with id ${gardenerId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        if (!customer.favorite_gardeners) {
            customer.favorite_gardeners = [];
        }

        if (!customer.favorite_gardeners.includes(gardener._id.toString())) {
            customer.favorite_gardeners.push(gardener._id.toString());
            await this.customerRepository.update(customerId, customer);
        }

        return {
            ...httpResponse.ADDED_TO_FAVORITES_SUCCESSFULLY,
            data: {
                customer,
            },
        };
    }

    async removeGardenerFromFavorites(
        customerId: string,
        gardenerId: string
    ): Promise<Response> {
        const customer = await this.customerRepository.findOneById(customerId);
        if (!customer) {
            throw new HttpException(
                `Customer with id ${customerId} not found`,
                HttpStatus.NOT_FOUND
            );
        }
        const gardener = await this.gardenRepository.findOneById(gardenerId);
        if (!gardener) {
            throw new HttpException(
                `Gardener with id ${gardenerId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        const index = customer.favorite_gardeners.indexOf(
            gardener._id.toString()
        );

        if (index > -1) {
            customer.favorite_gardeners.splice(index, 1);
            await this.customerRepository.update(customerId, customer);
        }

        return {
            ...httpResponse.REMOVED_FROM_FAVORITES_SUCCESSFULLY,
            data: {
                customer,
            },
        };
    }

    async listFavoriteGardeners(customerId: string): Promise<Response> {
        const customer = await this.customerModel
            .findById(customerId)
            .populate("favorite_gardeners");
        if (!customer) {
            throw new HttpException(
                `Customer with id ${customerId} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        return {
            ...httpResponse.LIST_FAVORITES_SUCCESSFULLY,
            data: {
                favorite_gardeners: customer.favorite_gardeners,
            },
        };
    }

    async handleAvatar(
        userId: string,
        image: Express.Multer.File
    ): Promise<Response> {
        try {
            const customer = await this.customerRepository.findOneById(userId);

            if (!customer) {
                throw new HttpException(
                    `Customer with ID ${userId} not found`,
                    HttpStatus.NOT_FOUND
                );
            }

            const { url, public_id } = await this.cloudinaryService.uploadFile(
                image
            );

            if (customer.avatar) {
                await this.customerAvatarRepository.update(customer.avatar, {
                    url,
                    public_id,
                    customer: customer._id.toString(),
                });
                return { ...httpResponse.UPDATE_AVATAR_SUCCESSFULLY };
            } else {
                const newAvatar = await this.customerAvatarRepository.create({
                    url,
                    public_id,
                    customer,
                });
                await this.customerRepository.update(customer._id.toString(), {
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
            const customer = await this.customerRepository.findOneById(userId);
            if (!customer) {
                throw new HttpException(
                    `Customer with ID ${userId} not found`,
                    HttpStatus.NOT_FOUND
                );
            }

            if (customer.avatar) {
                await this.customerRepository.update(customer._id.toString(), {
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
}
