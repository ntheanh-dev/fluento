import { http } from "./http-client";
import type { ApiResponse } from "./type";

export async function createRestClient<T>(endpoint: string,payload: any) : Promise<T> {
    const response = await http.post<ApiResponse<T>>(endpoint,payload);
    return response.data.result;
}

export async function getResource<T>(endpoint: string) : Promise<T> {
    const response = await http.get<ApiResponse<T>>(endpoint);
    return response.data.result;
}

export async function deleteResource(endpoint: string): Promise<void> {
    await http.delete<ApiResponse<void>>(endpoint);
}

export async function updateRestClient<T>(endpoint: string, payload: any): Promise<T> {
    const response = await http.put<ApiResponse<T>>(endpoint, payload);
    return response.data.result;
}