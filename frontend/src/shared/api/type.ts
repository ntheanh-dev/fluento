export type ApiResponse<T> = {
    result: T;
    code: number;
}

export interface Resource {
    id: number;
    embedded?: {
        [key: string]: Resource | Resource[];
    }
}