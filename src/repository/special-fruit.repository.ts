import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
    SpecialFruit,
    SpecialFruitDocument,
} from "@schemas/special_fruit.schema";
import { SpecialFruitsRepositoryInterface } from "interfaces/special-fruit.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class SpecialFruitRepository
    extends BaseRepositoryAbstract<SpecialFruitDocument>
    implements SpecialFruitsRepositoryInterface
{
    constructor(
        @InjectModel(SpecialFruit.name)
        private readonly fruitSpecialModel: Model<SpecialFruitDocument>
    ) {
        super(fruitSpecialModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<SpecialFruitDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<SpecialFruitDocument>> {
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
