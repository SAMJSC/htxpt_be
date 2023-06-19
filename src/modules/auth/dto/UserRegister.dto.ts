import { UserRoles } from "@constants/common.constants";
import {
    IsDateString,
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
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
    password: string;

    @IsNotEmpty()
    @IsString()
    passwordConfirm: string;
}
