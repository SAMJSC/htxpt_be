import { IsOptional, IsString } from "class-validator";

export class UpdateBlogDto {
    @IsString()
    @IsOptional()
    content: string;

    @IsString()
    @IsOptional()
    shortDescription: string;

    @IsString()
    @IsOptional()
    auth: string;
}
