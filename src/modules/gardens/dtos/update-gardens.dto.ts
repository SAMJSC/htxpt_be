import { GENDER } from "@constants/common.constants";
import { Transform } from "class-transformer";
import { IsDate, IsEnum, IsOptional, IsString, Min } from "class-validator";

export class UpdateGardenDto {
    @IsOptional()
    @IsString()
    first_name: string;

    @IsOptional()
    @IsString()
    user_name: string;

    @IsOptional()
    @IsString()
    middle_name: string;

    @IsOptional()
    @IsString()
    last_name: string;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    date_of_birth: Date;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @Min(0)
    age?: number;

    @IsOptional()
    @IsEnum(GENDER)
    gender?: GENDER;
}
