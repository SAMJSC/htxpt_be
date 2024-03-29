export enum SORT_TYPE {
    "DESC" = "desc",
    "ASC" = "acs",
}

export type FindAllResponse<T> = { count: number; items: T[] };

export type SortParams = { sort_by: string; sort_type: SORT_TYPE };

export type SearchParams = { keywork: string; field: string };

export type PaginateParams = { offset: number; limit: number };

export type LoginMetadata = {
    ipAddress: string;
    ua: string;
    deviceId: string;
};

export type SessionResponse = {
    userData?: any;
    accessToken?: string;
    refreshToken: string;
    loginMetaData?: LoginMetadata;
};

export interface PaginationOptions {
    limit: number;
    offset: number;
}
