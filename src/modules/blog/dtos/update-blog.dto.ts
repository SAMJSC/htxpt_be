import { IsOptional, IsString } from "class-validator";

export class UpdateBlogDto {
    @IsString()
    @IsOptional()
    content: string;

    @IsString()
    @IsOptional()
    short_description: string;

    @IsString()
    @IsOptional()
    auth: string;
}
