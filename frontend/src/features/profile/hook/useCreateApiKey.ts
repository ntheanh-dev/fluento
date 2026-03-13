import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileStore } from "../../../stores/profile";
import { createApiKey, getProfile } from "../api";
import { OK } from "../../../shared/api/query-keys";
import { PROFILE_EMBED_PRACTICESTATS } from "../query";

export function useCreateApiKey() {
    const queryClient = useQueryClient();
    const setProfile = useProfileStore((s) => s.setProfile);

    const mutation = useMutation({
        mutationFn: (apiKey: string) => createApiKey(apiKey),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: [OK.API_KEYS] });
            queryClient.invalidateQueries({ queryKey: [OK.PROFILE] });

            const user = await getProfile(PROFILE_EMBED_PRACTICESTATS);
            setProfile(user);
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
