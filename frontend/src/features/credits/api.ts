import { http } from "@/shared/api/http-client";
import type { ApiResponse } from "@/shared/api/type";

export type CreditBalance = {
    credits: number;
    coins?: number;
};

export function getMyCredits(): Promise<CreditBalance> {
    return http
        .get<ApiResponse<CreditBalance>>("/users/me/credits")
        .then((res) => res.data.result);
}

export function exchangeCoins(coins: number): Promise<CreditBalance> {
    return http
        .post<ApiResponse<CreditBalance>>("/users/me/exchange-coins", { coins })
        .then((res) => res.data.result);
}

