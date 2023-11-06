import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { Gardener } from "schemas/garden.schema";
import { FindAllResponse } from "types/common.type";

export interface GardenerRepositoryInterface
    extends BaseRepositoryInterface<Gardener> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<Gardener>>;
}
