import { InjectModel } from "@nestjs/mongoose";
import { CustomerAvatar } from "@schemas/customer_avatars.schema";
import { CustomerAvatarRepositoryInterface } from "interfaces/customer-avatar.repository";
import { Model } from "mongoose";
import { BaseRepositoryAbstract } from "repository/base/base.abstract.repository";
import { FindAllResponse } from "types/common.type";

export class CustomerAvatarRepository
    extends BaseRepositoryAbstract<CustomerAvatar>
    implements CustomerAvatarRepositoryInterface
{
    constructor(
        @InjectModel(CustomerAvatar.name)
        private readonly customerAvatarModel: Model<CustomerAvatar>
    ) {
        super(customerAvatarModel);
    }
    async findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<CustomerAvatar>> {
        const [count, items] = await Promise.all([
            this.customerAvatarModel.count({ ...condition, deleted_at: null }),
            this.customerAvatarModel.find({ ...condition, deleted_at: null }),
            options?.projection || "",
            {
                skip: options.offset || 0,
                limit: options.limit || 10,
            },
        ]);
        return {
            count,
            items,
        };
    }
}
