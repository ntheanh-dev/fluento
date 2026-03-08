import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { User } from "../../entities/users/schema";
import { OK } from "../../shared/api/query-keys";
import { getProfile } from "./api";

export const PROFILE_EMBED_API_KEY = "embedded=apiKey,practiceStats";

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