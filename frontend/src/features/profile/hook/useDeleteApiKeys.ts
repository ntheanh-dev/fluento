import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileStore } from "../../../stores/profile";
import { deleteApiKey, getProfile } from "../api";
import { PROFILE_EMBED_API_KEY } from "../query";
import { OK } from "../../../shared/api/query-keys";

export function useDeleteApiKey() {
    const queryClient = useQueryClient();
    const setProfile = useProfileStore((s) => s.setProfile);

    const mutation = useMutation({
        mutationFn: (apiKey: string) => deleteApiKey(apiKey),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: [OK.PROFILE] });
            const user = await queryClient.fetchQuery({
                queryKey: [OK.PROFILE, PROFILE_EMBED_API_KEY],
                queryFn: () => getProfile(PROFILE_EMBED_API_KEY),
            });
            setProfile(user);
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
