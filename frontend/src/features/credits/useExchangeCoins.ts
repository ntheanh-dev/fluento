import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exchangeCoins } from "./api";
import { OK } from "@/shared/api/query-keys";

export function useExchangeCoins() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (coins: number) => exchangeCoins(coins),
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: [OK.PROFILE, "credits"] });
        },
    });
}
