import { EDirection } from "@constants/api.constants";

export interface IPagination {
    limit: number;
    page: number;
    sortBy?: string;
    direction?: EDirection;
}
