export type ApiResponse<T> = {
    result: T;
    code: number;
}

export type ApiError = {
    message: string;
    code: number;
}

export interface Resource {
    id: number;
    embedded?: {
        [key: string]: Resource | Resource[];
    }
}