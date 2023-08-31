import { IsOptional, IsString } from "class-validator";

export class UpdateFruitSpecialDto {
    @IsOptional()
    @IsString()
    readonly fruit_name: string;

    @IsOptional()
    readonly price: number;

    @IsOptional()
    readonly shape: string[];

    @IsOptional()
    readonly dimeter: number;

    @IsOptional()
    readonly weight: number;
}
