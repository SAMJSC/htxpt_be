import { GENDER, USER_ROLES } from "@constants/common.constants";
import { Document } from "mongoose";

export interface IGarden extends Document {
    readonly last_name: string;
    readonly middle_name?: string;
    readonly address?: string;
    readonly age?: number;
    readonly gender?: GENDER;
    readonly user_name: string;
    readonly password: string;
    readonly reset_token?: string;
    readonly first_name?: string;
    readonly role: USER_ROLES;
    readonly email?: string;
    readonly date_of_birth?: Date;
    readonly phone?: string;
    readonly avatar?: string;
}
