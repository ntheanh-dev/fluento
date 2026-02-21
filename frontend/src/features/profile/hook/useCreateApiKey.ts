import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileStore } from "../../../stores/profile";
import { createApiKey } from "../api";
import { OK } from "../../../shared/api/query-keys";

export function useCreateApiKey() {
    const queryClient = useQueryClient();
    const setProfile = useProfileStore((s) => s.setProfile);

    const mutation = useMutation({
        mutationFn: (apiKey: string) => createApiKey(apiKey),
        onSuccess: (user) => {
            setProfile(user);
            queryClient.invalidateQueries({ queryKey: [OK.PROFILE] });
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
    };
}
