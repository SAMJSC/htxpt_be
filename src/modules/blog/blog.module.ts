import { BlogController } from "@modules/blog/blog.controller";
import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Blog, BlogSchema } from "@schemas/blog.schema";
import { BlogRepository } from "repository/blog.repository";

import { BlogService } from "./blog.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
    ],
    providers: [
        BlogService,
        { provide: "BlogRepositoryInterface", useClass: BlogRepository },
    ],
    controllers: [BlogController],
    exports: [BlogService],
})
export class BlogModule {}
