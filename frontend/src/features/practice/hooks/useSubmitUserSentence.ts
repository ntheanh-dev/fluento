import type { SubmitAnswerRequest } from "@/entities/userPractice/schema";
import { useMutation } from "@tanstack/react-query";
import { submitUserSentence } from "../api";
import { queryClient } from "@/app/providers/query-client";
import { OK } from "@/shared/api/query-keys";

export function useSubmitUserSentence(id: number, payload: SubmitAnswerRequest) {

    const mutation = useMutation({
        mutationFn: () => submitUserSentence(id, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: OK.userPractice(id) });
        },
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}