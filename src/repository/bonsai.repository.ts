import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Bonsai, BonsaiDocument } from "@schemas/bonsai_tree.schema";
import { BonsaiRepositoryInterface } from "interfaces/bonsai-repository.interface";
import { Model } from "mongoose";
import { BaseRepositoryAbstract } from "repository/base/base.abstract.repository";
import { FindAllResponse } from "types/common.type";

@Injectable()
export class BonsaiRepository
    extends BaseRepositoryAbstract<Bonsai>
    implements BonsaiRepositoryInterface
{
    constructor(
        @InjectModel(Bonsai.name)
        private readonly bonsaiModel: Model<BonsaiDocument>
    ) {
        super(bonsaiModel);
    }

    async findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<Bonsai>> {
        const [count, items] = await Promise.all([
            this.bonsaiModel.count({ ...condition, deleted_at: null }),
            this.bonsaiModel.find({ ...condition, deleted_at: null }),
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
