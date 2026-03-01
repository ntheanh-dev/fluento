import { useMutation } from "@tanstack/react-query";
import { getAnswerPreview } from "../api";
import type { AnswerPreviewInput } from "../schema";

export function useAnswerPreviewData(id: number, payload: AnswerPreviewInput) {
    const mutation = useMutation({
        mutationFn: () => getAnswerPreview(id, payload),
    });

    return {
        mutateAsync: mutation.mutateAsync,
        isPending: mutation.isPending,
        error: mutation.error,
    };
}