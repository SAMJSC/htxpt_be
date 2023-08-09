import { USER_ROLES } from "@constants/common.constants";
import { CustomerRegistrationDto } from "@modules/auth/dtos/customer-registration.dto";
import { UpdateCustomerDto } from "@modules/customers/dtos/update-customer.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { DeviceSession } from "@schemas/device_session.schema";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { CustomerRepositoryInterface } from "interfaces/customer-repository.interface";
import mongoose, { Model } from "mongoose";
import { Customer } from "schemas/customer.schema";
import { Gardener } from "schemas/garden.schema";
import { BaseServiceAbstract } from "services/base.abstract.service";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class CustomersService extends BaseServiceAbstract<Customer> {
    constructor(
        @Inject("CustomerRepositoryInterface")
        private readonly customerRepository: CustomerRepositoryInterface,
        @InjectModel(DeviceSession.name)
        private readonly deviceSessionModel: Model<DeviceSession>
    ) {
        super(customerRepository);
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

    async getCustomerByEmail(email: string): Promise<Gardener> {
        try {
            const garden = await this.customerRepository.findOneByCondition({
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
}
