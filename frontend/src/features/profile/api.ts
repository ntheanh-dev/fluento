import type { User } from "../../entities/users/schema";
import { getResource } from "../../shared/api/rest-client";
import { http } from "../../shared/api/http-client";
import type { ApiResponse } from "../../shared/api/type";

const BASE = "/users/me";

export const getProfile = (queryParams?: string): Promise<User> => {
    return getResource<User>(BASE + (queryParams ? `?${queryParams}` : ""));
};

export type UpdateMePayload = {
    fullName?: string;
    newPassword?: string;
    currentPassword?: string;
    activeApiKeyId?: number;
};

export function updateMe(payload: UpdateMePayload, avatar?: File): Promise<User> {
    const form = new FormData();
    const profileJson = JSON.stringify(payload);
    form.append(
        "profile",
        new Blob([profileJson], { type: "application/json" }),
        "profile.json"
    );
    if (avatar) form.append("avatar", avatar);

    return http.put<ApiResponse<User>>(BASE, form).then((res) => res.data.result);
}

/** Tạo API key mới (backend tạo 3 model cho key). */
export function createApiKey(apiKey: string): Promise<User> {
    return http
        .post<ApiResponse<unknown>>("/api-keys", { apiKey })
        .then(() => getProfile("embedded=apiKey"))
        .then((user) => user as User);
}

/** Xóa API key theo giá trị key (xóa toàn bộ nhóm key + model). */
export function deleteApiKey(apiKey: string): Promise<void> {
    if (!apiKey?.trim()) return Promise.resolve();
    return http.delete("/api-keys", { data: { apiKey: apiKey.trim() } }).then(() => undefined);
}