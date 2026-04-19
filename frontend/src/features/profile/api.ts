import type { User } from "../../entities/users/schema";
import { getResource } from "../../shared/api/rest-client";
import { http } from "../../shared/api/http-client";
import type { ApiResponse } from "../../shared/api/type";

const BASE = "/users/me";

export const getProfile = (queryParams?: string): Promise<User> => {
    return getResource<User>(BASE + (queryParams ? `?${queryParams}` : ""));
};

export type UsageTransaction = {
    id: number;
    amount: number;
    type: "AI_USAGE" | "TOP_UP" | "COIN_EXCHANGE" | "REFUND";
    status: "PENDING" | "SUCCESS" | "FAILED";
    referenceId?: string | null;
    createdAt: string;
};

export type SubscriptionUsage = {
    content: UsageTransaction[];
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
};

export type UsageSortField = "type" | "amount" | "status" | "createdAt";
export type UsageSortDir = "asc" | "desc";

export const getSubscriptionUsage = (
    page = 0,
    size = 10,
    sortBy: UsageSortField = "createdAt",
    sortDir: UsageSortDir = "desc"
): Promise<SubscriptionUsage> => {
    return getResource<SubscriptionUsage>(
        `/credit-transactions?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`
    );
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
