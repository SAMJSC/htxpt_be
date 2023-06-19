import { UserRoles } from "@constants/common.constants";
import { UserEntity } from "@entities/user.entity";

export type Constructor<T, Arguments extends unknown[] = undefined[]> = new (
    ...arguments_: Arguments
) => T;

export interface SafeUser {
    id: string;
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
    user: UserEntity;
}
