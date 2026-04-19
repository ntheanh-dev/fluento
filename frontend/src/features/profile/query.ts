import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { User } from "../../entities/users/schema";
import { OK } from "../../shared/api/query-keys";
import {
    getProfile,
    getSubscriptionUsage,
    type SubscriptionUsage,
    type UsageSortDir,
    type UsageSortField,
} from "./api";

export const PROFILE_EMBED_PRACTICESTATS = "embedded=practiceStats";

export type UseProfileDataParams = {
    queryParams?: string;
};

export function useProfileData(params?: UseProfileDataParams | string) {
    const hasToken = !!Cookies.get("accessToken");
    const queryParams =
        typeof params === "string" ? params : params?.queryParams;

    return useQuery<User>({
        queryKey: [OK.PROFILE, queryParams ?? null],
        queryFn: () => getProfile(queryParams),
        placeholderData: keepPreviousData,
        enabled: hasToken,
    });
}

export function useSubscriptionUsage(
    page = 0,
    size = 10,
    sortBy: UsageSortField = "createdAt",
    sortDir: UsageSortDir = "desc"
) {
    const hasToken = !!Cookies.get("accessToken");

    return useQuery<SubscriptionUsage>({
        queryKey: [OK.SUBSCRIPTION_USAGE, page, size, sortBy, sortDir],
        queryFn: () => getSubscriptionUsage(page, size, sortBy, sortDir),
        placeholderData: keepPreviousData,
        enabled: hasToken,
    });
}
