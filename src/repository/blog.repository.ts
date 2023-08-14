import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Blog, BlogDocument } from "@schemas/blog.schema";
import { BlogRepositoryInterface } from "interfaces/blog-repository.interface";
import { FilterQuery, Model, PopulateOptions } from "mongoose";
import { FindAllResponse } from "types/common.type";

import { BaseRepositoryAbstract } from "./base/base.abstract.repository";

@Injectable()
export class BlogRepository
    extends BaseRepositoryAbstract<BlogDocument>
    implements BlogRepositoryInterface
{
    constructor(
        @InjectModel(Blog.name)
        private readonly blogModel: Model<BlogDocument>
    ) {
        super(blogModel);
    }

    async findAllWithSubFields(
        condition: FilterQuery<BlogDocument>,
        options: {
            projection?: string;
            populate?: string[] | PopulateOptions | PopulateOptions[];
            offset?: number;
            limit?: number;
        }
    ): Promise<FindAllResponse<BlogDocument>> {
        const [count, items] = await Promise.all([
            this.blogModel.count({ ...condition, deleted_at: null }),
            this.blogModel
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
