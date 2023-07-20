import { USER_ROLES } from "@constants/common.constants";
import { Admin } from "@schemas/admin.schema";
import { Garden } from "@schemas/garden.schema";
export type Constructor<T, Arguments extends unknown[] = undefined[]> = new (
    ...arguments_: Arguments
) => T;

export interface SafeUser {
    email?: string;
    role: USER_ROLES;
    delete_at?: string;
}

export interface LoginResponseData {
    accessToken: string;
    refreshToken: string;
    userData: SafeUser;
}

export interface LoginMetadata {
    ipAddress: string;
    ua: string;
    deviceId: string;
}
export interface Session {
    device_id: string;
    name: string;
    ua: string;
    refresh_token: string;
    expired_at: Date;
    ip_address: string;
    gardener: Garden;
    admin: Admin;
    super_admin: Admin;
    delete_at?: string;
}

export interface GenerateAccessJWTData {
    accessToken: string;
}
