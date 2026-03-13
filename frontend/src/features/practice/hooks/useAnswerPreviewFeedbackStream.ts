import { useMutation } from "@tanstack/react-query";
import type { AnswerPreviewInput } from "../schema";
import { getAnswerPreview } from "../api";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";

type UseAnswerPreviewFeedbackResult = {
  mutateAsync: () => Promise<SentenceFeedback>;
  isPending: boolean;
  error: unknown;
};

export function useAnswerPreviewFeedback(
  id: number,
  payload: AnswerPreviewInput,
): UseAnswerPreviewFeedbackResult {
  const mutation = useMutation({
    mutationFn: () => getAnswerPreview(id, payload),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

