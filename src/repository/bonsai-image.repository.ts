import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { BonsaiImage, BonsaiImageDocument } from "@schemas/bonsai_image.schema";
import { BonsaiImageRepositoryInterface } from "interfaces/bonsai-image-repository.interface";
import { Model } from "mongoose";
import { BaseRepositoryAbstract } from "repository/base/base.abstract.repository";
import { FindAllResponse } from "types/common.type";

@Injectable()
export class BonsaiImageRepository
    extends BaseRepositoryAbstract<BonsaiImage>
    implements BonsaiImageRepositoryInterface
{
    constructor(
        @InjectModel(BonsaiImage.name)
        private readonly bonsaiImageModel: Model<BonsaiImageDocument>
    ) {
        super(bonsaiImageModel);
    }
    async findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<BonsaiImage>> {
        const [count, items] = await Promise.all([
            this.bonsaiImageModel.count({ ...condition, deleted_at: null }),
            this.bonsaiImageModel.find({ ...condition, deleted_at: null }),
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
