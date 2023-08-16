import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
    FruitCategory,
    FruitCategoryDocument,
} from "@schemas/fruit_category.chema";
import { FruitCategoryRepositoryInterface } from "interfaces/fruit-category.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class FruitCategoryRepository
    extends BaseRepositoryAbstract<FruitCategoryDocument>
    implements FruitCategoryRepositoryInterface
{
    constructor(
        @InjectModel(FruitCategory.name)
        private readonly fruitSpecialModel: Model<FruitCategoryDocument>
    ) {
        super(fruitSpecialModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<FruitCategoryDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<FruitCategoryDocument>> {
        const [count, items] = await Promise.all([
            this.fruitSpecialModel.count({ ...condition, deleted_at: null }),
            this.fruitSpecialModel
                .find(
                    { ...condition, deleted_at: null },
                    options?.projection || "",
                    {
                        skip: options.offset || 0,
                        limit: options.limit || 10,
                    }
                )
                .populate(options.populate),
        ]);
        return {
            count,
            items,
        };
    }
}
