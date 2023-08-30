import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateBonsaiDto {
    @IsOptional()
    @IsString()
    readonly tree_name: string;

    @Transform(({ value }) => Number(value))
    @IsOptional()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsOptional()
    @IsString()
    readonly description: string;
}
