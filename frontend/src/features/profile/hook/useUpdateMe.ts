import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useProfileStore } from "../../../stores/profile";
import { updateMe, type UpdateMePayload } from "../api";
import { OK } from "../../../shared/api/query-keys";

export function useUpdateMe() {
    const queryClient = useQueryClient();
    const setProfile = useProfileStore((s) => s.setProfile);

    const mutation = useMutation({
        mutationFn: ({
            payload,
            avatar,
        }: {
            payload: UpdateMePayload;
            avatar?: File;
        }) => updateMe(payload, avatar),
        onSuccess: (user) => {
            setProfile(user);
            queryClient.invalidateQueries({ queryKey: [OK.PROFILE] });
        },
    });

    return {
        mutateAsync: (payload: UpdateMePayload, avatar?: File) =>
            mutation.mutateAsync({ payload, avatar }),
        isPending: mutation.isPending,
    };
}
