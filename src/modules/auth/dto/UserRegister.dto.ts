import { UserRoles } from "@constants/common.constants";
import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from "class-validator";

export class UserRegisterDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;

    @IsString()
    middleName: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsPhoneNumber()
    phone: string;

    @IsEnum(UserRoles)
    @IsOptional()
    role?: UserRoles;

    @IsString()
    @IsOptional()
    photo?: string;

    @IsDateString()
    @IsDateString()
    dateOfBirth: Date;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password is too weak",
    })
    password: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(32)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: "Password is too weak",
    })
    passwordConfirm: string;
}
