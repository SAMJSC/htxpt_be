import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Customer, CustomerDocument } from "@schemas/customer.schema";
import { CustomerRepositoryInterface } from "interfaces/customer-repository.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class CustomerRepository
    extends BaseRepositoryAbstract<CustomerDocument>
    implements CustomerRepositoryInterface
{
    constructor(
        @InjectModel(Customer.name)
        private readonly customerModel: Model<CustomerDocument>
    ) {
        super(customerModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<CustomerDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<CustomerDocument>> {
        const [count, items] = await Promise.all([
            this.customerModel.count({ ...condition, deleted_at: null }),
            this.customerModel
                .find(
                    { ...condition, deleted_at: null },
                    options?.projection || "",
                    {
                        skip: options.offset || 0,
                        limit: options.limit || 10,
                    }
                )
                .populate(options.populate),
        ]);
        return {
            count,
            items,
        };
    }
}
