import { USER_ROLES } from "@constants/common.constants";
import { JwtAuthGuard } from "@guards/jwt-auth.guard";
import { RolesGuard } from "@guards/roles.guard";
import { BlogService } from "@modules/blog/blog.service";
import { CreateBlogDto } from "@modules/blog/dtos/create-blog.dto";
import { UpdateBlogDto } from "@modules/blog/dtos/update-blog.dto";
import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from "@nestjs/common";
import { Admin } from "@schemas/admin.schema";
import { Response } from "@shared/response/response.interface";
import { UserDecorator } from "decorators/current-user.decorator";
import { Roles } from "decorators/roles.decorator";
import { PaginationOptions } from "types/common.type";

@Controller("blog")
export class BlogController {
    constructor(private readonly blogService: BlogService) {}

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    @Post("/create")
    async createBlog(
        @Body() createBlogDto: CreateBlogDto,
        @UserDecorator() user: Admin
    ): Promise<Response> {
        const blog = await this.blogService.createBlog(
            user._id.toString(),
            createBlogDto
        );
        return blog;
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    @Patch("/:blogId")
    async editBlog(
        @Param("blogId") blogId: string,
        @Body() updateBlogDto: UpdateBlogDto
    ): Promise<Response> {
        const newBlog = await this.blogService.editBlog(blogId, updateBlogDto);
        return newBlog;
    }

    @Get("/:blogId")
    async findBlog(@Param("blogId") blogId: string): Promise<Response> {
        return await this.blogService.findBlog(blogId);
    }

    @Get()
    getAllBlogs(@Query() query: any): Promise<Response> {
        const filterObject = {};
        const operationsMap = {
            gt: "$gt",
            lt: "$lt",
            gte: "$gte",
            lte: "$lte",
            eq: "$eq",
        };

        for (const key in query) {
            if (key != "limit" && key != "skip") {
                if (
                    typeof query[key] === "object" &&
                    !Array.isArray(query[key])
                ) {
                    const operations = Object.keys(query[key]);
                    filterObject[key] = {};
                    for (const op of operations) {
                        if (operationsMap[op]) {
                            filterObject[key][operationsMap[op]] = Number(
                                query[key][op]
                            );
                        }
                    }
                } else {
                    filterObject[key] = new RegExp(query[key], "i");
                }
            }
        }

        const options: PaginationOptions = {
            limit: Number(query.limit) || 99999,
            offset: Number(query.offset) || 0,
        };

        return this.blogService.getAllBlogs(filterObject, options);
    }

    @UseGuards(RolesGuard, JwtAuthGuard)
    @Roles(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN)
    @Delete("/:blogId")
    async deleteBlog(@Param("blogId") blogId: string): Promise<Response> {
        return await this.blogService.deleteBlog(blogId);
    }
}
