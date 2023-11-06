import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateBonsaiDto {
    @IsNotEmpty()
    @IsString()
    readonly tree_name: string;

    @Transform(({ value }) => Number(value))
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    readonly quantity: number;

    @IsNotEmpty()
    @IsString()
    readonly description: string;
}
