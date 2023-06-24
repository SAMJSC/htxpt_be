import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GardensRepositoryInterface } from "interfaces/gardens-repository.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { Garden, GardensDocument } from "schemas/garden.schema";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class GardensRepository
    extends BaseRepositoryAbstract<GardensDocument>
    implements GardensRepositoryInterface
{
    constructor(
        @InjectModel(Garden.name)
        private readonly gardenModel: Model<GardensDocument>
    ) {
        super(gardenModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<GardensDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<GardensDocument>> {
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
