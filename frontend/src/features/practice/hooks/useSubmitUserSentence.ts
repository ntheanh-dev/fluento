import type { SubmitAnswerRequest } from "@/entities/userPractice/schema";
import { useMutation } from "@tanstack/react-query";
import { submitUserSentence } from "../api";

export function useSubmitUserSentence(id: number, payload: SubmitAnswerRequest) {

    const mutation = useMutation({
        mutationFn: () => submitUserSentence(id, payload),
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}