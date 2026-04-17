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
  onTextChunk?: (fullText: string) => void,
  onPartialFeedback?: (partial: Partial<SentenceFeedback>) => void,
): UseAnswerPreviewFeedbackResult {
  const mutation = useMutation({
    mutationFn: () => getAnswerPreview(id, payload, onTextChunk, onPartialFeedback),
  });

  return {
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

