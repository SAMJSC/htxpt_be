import { FruitImage } from "@schemas/fruit_image.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface FruitImageRepositoryInterface
    extends BaseRepositoryInterface<FruitImage> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<FruitImage>>;
}
