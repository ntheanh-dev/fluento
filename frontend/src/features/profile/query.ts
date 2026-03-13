import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { User } from "../../entities/users/schema";
import type { ApiKey } from "../../entities/apiKey/schema";
import { OK } from "../../shared/api/query-keys";
import { getMyApiKeys, getProfile } from "./api";

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

export function useApiKeys() {
    const hasToken = !!Cookies.get("accessToken");
    return useQuery<ApiKey[]>({
        queryKey: [OK.API_KEYS],
        queryFn: () => getMyApiKeys(),
        enabled: hasToken,
    });
}