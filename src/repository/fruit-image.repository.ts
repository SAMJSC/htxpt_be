import { InjectModel } from "@nestjs/mongoose";
import { FruitImage, FruitImageDocument } from "@schemas/fruit_image.schema";
import { FruitImageRepositoryInterface } from "interfaces/fruit-image-repository.interface";
import { Model } from "mongoose";
import { BaseRepositoryAbstract } from "repository/base/base.abstract.repository";
import { FindAllResponse } from "types/common.type";

export class FruitImageRepository
    extends BaseRepositoryAbstract<FruitImage>
    implements FruitImageRepositoryInterface
{
    constructor(
        @InjectModel(FruitImage.name)
        private readonly fruitImageModel: Model<FruitImageDocument>
    ) {
        super(fruitImageModel);
    }
    async findAllWithSubFields(
        condition: object,
        options: {
            projection?: string;
            populate?: any;
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<FruitImage>> {
        const [count, items] = await Promise.all([
            this.fruitImageModel.count({ ...condition, deleted_at: null }),
            this.fruitImageModel.find({ ...condition, deleted_at: null }),
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
