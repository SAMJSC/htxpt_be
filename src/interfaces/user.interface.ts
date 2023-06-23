import { Gender, UserRoles } from "@constants/common.constants";
import { Document } from "mongoose";
import { DeviceSession } from "schemas/devices-session.schema";

export interface IUser extends Document {
    readonly last_name: string;
    readonly middle_name?: string;
    readonly address?: string;
    readonly age?: number;
    readonly gender?: Gender;
    readonly user_name: string;
    readonly password: string;
    readonly reset_token?: string;
    readonly first_name?: string;
    readonly role: UserRoles;
    readonly email?: string;
    readonly date_of_birth?: Date;
    readonly phone?: string;
    readonly avatar?: string;
    device_sessions: DeviceSession;
}
