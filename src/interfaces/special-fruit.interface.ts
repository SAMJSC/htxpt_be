import { SpecialFruit } from "@schemas/special_fruit.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface SpecialFruitsRepositoryInterface
    extends BaseRepositoryInterface<SpecialFruit> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<SpecialFruit>>;
}
