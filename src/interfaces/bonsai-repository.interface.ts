import { Bonsai } from "@schemas/bonsai_tree.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface BonsaiRepositoryInterface
    extends BaseRepositoryInterface<Bonsai> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<Bonsai>>;
}
