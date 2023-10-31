import { CreateBlogDto } from "@modules/blog/dtos/create-blog.dto";
import { UpdateBlogDto } from "@modules/blog/dtos/update-blog.dto";
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { httpResponse } from "@shared/response";
import { Response } from "@shared/response/response.interface";
import { BlogRepositoryInterface } from "interfaces/blog-repository.interface";
import mongoose from "mongoose";
import { PaginationOptions } from "types/common.type";

@Injectable()
export class BlogService {
    constructor(
        @Inject("BlogRepositoryInterface")
        private readonly blogRepository: BlogRepositoryInterface
    ) {}

    async createBlog(
        authId: string,
        createBlogDto: CreateBlogDto
    ): Promise<Response> {
        await this.blogRepository.create({ ...createBlogDto, auth: authId });
        return httpResponse.CREATE_BLOG_SUCCESS;
    }

    async editBlog(
        blogId: string,
        updateBlogDto: UpdateBlogDto
    ): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            throw new HttpException(
                `The id ${blogId} is not valid`,
                HttpStatus.BAD_REQUEST
            );
        }
        const blog = await this.blogRepository.findOneById(blogId);

        if (!blog) {
            throw new HttpException(
                "The blog doesn't existed",
                HttpStatus.NOT_FOUND
            );
        }

        Object.assign(blog, updateBlogDto);
        await this.blogRepository.update(blogId, blog);

        return {
            ...httpResponse.UPDATE_BLOG_SUCCESSFULLY,
            data: blog,
        };
    }

    async findBlog(blogId: string): Promise<Response> {
        const blog = await this.blogRepository.findOneById(blogId);

        if (!blog) {
            throw new HttpException("Blog not found", HttpStatus.NOT_FOUND);
        }

        return {
            ...httpResponse.FIND_BLOG_RESPONSE,
            data: blog,
        };
    }

    async getAllBlogs(
        filterObject: any,
        options: PaginationOptions
    ): Promise<Response> {
        const blogs = await this.blogRepository.findAllWithSubFields(
            filterObject,
            options
        );
        return {
            ...httpResponse.GET_ALL_BLOG_SUCCESSFULLY,
            data: blogs,
        };
    }

    async deleteBlog(blogId: string): Promise<Response> {
        if (!mongoose.Types.ObjectId.isValid(blogId)) {
            throw new HttpException("Invalid blog ID", HttpStatus.BAD_REQUEST);
        }
        const blog = await this.blogRepository.findOneById(blogId);

        if (!blog) {
            throw new HttpException("Blog not found", HttpStatus.NOT_FOUND);
        }

        await this.blogRepository.permanentlyDelete(blog._id.toString());

        return httpResponse.DELETE_BLOG_SUCCESSFULLY;
    }
}
