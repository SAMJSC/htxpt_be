import { Customer } from "@schemas/customer.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface CustomerRepositoryInterface
    extends BaseRepositoryInterface<Customer> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<Customer>>;
}
