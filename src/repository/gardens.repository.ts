import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GardenerRepositoryInterface } from "interfaces/gardens-repository.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { Gardener, GardenerDocument } from "schemas/garden.schema";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class GardensRepository
    extends BaseRepositoryAbstract<GardenerDocument>
    implements GardenerRepositoryInterface
{
    constructor(
        @InjectModel(Gardener.name)
        private readonly gardenModel: Model<GardenerDocument>
    ) {
        super(gardenModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<GardenerDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<GardenerDocument>> {
        const [count, items] = await Promise.all([
            this.gardenModel.count({ ...condition, deleted_at: null }),
            this.gardenModel
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
