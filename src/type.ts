import { UserRoles } from "@constants/common.constants";
import { IUser } from "interfaces/user.interface";

export type Constructor<T, Arguments extends unknown[] = undefined[]> = new (
    ...arguments_: Arguments
) => T;

export interface SafeUser {
    email?: string;
    role: UserRoles;
}

export interface LoginMetadata {
    ipAddress: string;
    ua: string;
    deviceId: string;
}

export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    userData: SafeUser;
}

export interface Session {
    id: string;
    deviceId: string;
    name: string;
    ua: string;
    refreshToken: string;
    expiredAt: Date;
    ipAddress: string;
    createdAt: Date;
    updatedAt: Date;
    user: IUser;
}
