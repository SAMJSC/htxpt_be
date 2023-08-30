import { BonsaiImage } from "@schemas/bonsai_image.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface BonsaiImageRepositoryInterface
    extends BaseRepositoryInterface<BonsaiImage> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<BonsaiImage>>;
}
