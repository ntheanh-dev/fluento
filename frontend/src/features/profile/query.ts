import { keepPreviousData, useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import type { User } from "../../entities/users/schema";
import { OK } from "../../shared/api/query-keys";
import { getProfile } from "./api";

export function useProfile() {
    const hasToken = !!Cookies.get("accessToken");
    return useQuery<User>({
        queryKey: [OK.PROFILE],
        queryFn: () => getProfile(),
        placeholderData: keepPreviousData,
        enabled: hasToken,
    });
}