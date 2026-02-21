import type { User } from "../../entities/users/schema";
import { getResource } from "../../shared/api/rest-client";
import { http } from "../../shared/api/http-client";
import type { ApiResponse } from "../../shared/api/type";

const BASE = "/users/me";

export const getProfile = (): Promise<User> => {
    return getResource<User>(BASE);
};

export type UpdateMePayload = {
    fullName?: string;
    newPassword?: string;
    currentPassword?: string;
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