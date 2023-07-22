import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Admin, AdminDocument } from "@schemas/admin.schema";
import { AdminRepositoryInterface } from "interfaces/admin-repository.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class AdminRepository
    extends BaseRepositoryAbstract<AdminDocument>
    implements AdminRepositoryInterface
{
    constructor(
        @InjectModel(Admin.name)
        private readonly adminModel: Model<AdminDocument>
    ) {
        super(adminModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<AdminDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<AdminDocument>> {
        const [count, items] = await Promise.all([
            this.adminModel.count({ ...condition, deleted_at: null }),
            this.adminModel
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
