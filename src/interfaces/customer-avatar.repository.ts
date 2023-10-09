import { CustomerAvatar } from "@schemas/customer_avatars.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface CustomerAvatarRepositoryInterface
    extends BaseRepositoryInterface<CustomerAvatar> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<CustomerAvatar>>;
}
