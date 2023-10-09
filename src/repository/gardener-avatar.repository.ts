import { InjectModel } from "@nestjs/mongoose";
import { GardenerAvatar } from "@schemas/gardener_avatars.schema";
import { GardenerAvatarRepositoryInterface } from "interfaces/gardener-avatars-repository";
import { Model } from "mongoose";
import { BaseRepositoryAbstract } from "repository/base/base.abstract.repository";
import { FindAllResponse } from "types/common.type";

export class GardenerAvatarRepository
    extends BaseRepositoryAbstract<GardenerAvatar>
    implements GardenerAvatarRepositoryInterface
{
    constructor(
        @InjectModel(GardenerAvatar.name)
        private readonly gardenerAvatarModel: Model<GardenerAvatar>
    ) {
        super(gardenerAvatarModel);
    }
    async findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<GardenerAvatar>> {
        const [count, items] = await Promise.all([
            this.gardenerAvatarModel.count({ ...condition, deleted_at: null }),
            this.gardenerAvatarModel.find({ ...condition, deleted_at: null }),
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
