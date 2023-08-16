import { FruitCategory } from "@schemas/fruit_category.chema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface FruitCategoryRepositoryInterface
    extends BaseRepositoryInterface<FruitCategory> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<FruitCategory>>;
}
