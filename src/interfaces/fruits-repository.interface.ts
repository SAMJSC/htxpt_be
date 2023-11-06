import { Fruit } from "@schemas/fruit.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface FruitsRepositoryInterface
    extends BaseRepositoryInterface<Fruit> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<Fruit>>;
}
