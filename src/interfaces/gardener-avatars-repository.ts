import { GardenerAvatar } from "@schemas/gardener_avatars.schema";
import { BaseRepositoryInterface } from "repository/base/base.interface.repository";
import { FindAllResponse } from "types/common.type";

export interface GardenerAvatarRepositoryInterface
    extends BaseRepositoryInterface<GardenerAvatar> {
    findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: string[] | any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<GardenerAvatar>>;
}
