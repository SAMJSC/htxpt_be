import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Fruit, FruitDocument } from "@schemas/fruit.schema";
import { FruitsRepositoryInterface } from "interfaces/fruits-repository.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class FruitRepository
    extends BaseRepositoryAbstract<FruitDocument>
    implements FruitsRepositoryInterface
{
    constructor(
        @InjectModel(Fruit.name)
        private readonly fruitModel: Model<FruitDocument>
    ) {
        super(fruitModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<FruitDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<FruitDocument>> {
        const [count, items] = await Promise.all([
            this.fruitModel.count({ ...condition, deleted_at: null }),
            this.fruitModel
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
