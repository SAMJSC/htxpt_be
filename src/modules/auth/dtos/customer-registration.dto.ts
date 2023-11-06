import { GENDER } from "@constants/common.constants";
import { Transform } from "class-transformer";
import {
    IsDate,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    Min,
} from "class-validator";

export class CustomerRegistrationDto {
    @IsOptional()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password is too weak",
    })
    readonly password: string;

    @IsNotEmpty()
    @IsString()
    readonly confirm_password: string;

    @IsOptional()
    @IsString()
    user_name: string;

    @IsOptional()
    @IsString()
    first_name?: string;

    @IsOptional()
    @IsString()
    middle_name?: string;

    @IsOptional()
    @IsString()
    last_name?: string;

    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    date_of_birth?: Date;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @Min(0)
    age?: number;

    @IsOptional()
    @IsEnum(GENDER)
    gender?: GENDER;
}
