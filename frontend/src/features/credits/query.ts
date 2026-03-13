import { useQuery } from "@tanstack/react-query";
import Cookies from "js-cookie";
import { getMyCredits, type CreditBalance } from "./api";
import { OK } from "@/shared/api/query-keys";

export function useCredits() {
    const hasToken = !!Cookies.get("accessToken");
    return useQuery<CreditBalance>({
        queryKey: [OK.PROFILE, "credits"],
        queryFn: getMyCredits,
        enabled: hasToken,
    });
}

