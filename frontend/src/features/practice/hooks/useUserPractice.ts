import { useMutation, useQuery } from "@tanstack/react-query";
import { getCommunityTranslations, getSentenceVocabularyHints, getUserPracticeById } from "../api";
import type { CommunityScoreBand, CommunityTranslation } from "@/entities/paragraphSentence/schema";
import type { ParagraphSentence, VocabularyHint } from "@/entities/paragraphSentence/schema";
import type { UserPractice } from "../../../entities/userPractice/schema";
import { OK } from "../../../shared/api/query-keys";
import { queryClient } from "@/app/providers/query-client";


export function useUserPracticeData(id: number) {
  const { data, isLoading, error } = useQuery<UserPractice>({
    queryKey: OK.userPractice(id),
    queryFn: () => getUserPracticeById(id),
  });

  return { data, isLoading, error };
}

export function useSentenceVocabularyHints(sentenceId: number) {
  const mutation = useMutation({
    mutationFn: ({
      targetLanguage,
      onTextChunk,
      onPartialHints,
    }: {
      targetLanguage?: "EN" | "ZH" | "KO";
      onTextChunk?: (fullText: string) => void;
      onPartialHints?: (partial: VocabularyHint[]) => void;
    } = {}) => getSentenceVocabularyHints(sentenceId, targetLanguage ?? "EN", onTextChunk, onPartialHints),
    onSuccess: (data) => {
      if (data.vocabularyHints) {
        queryClient.setQueryData<VocabularyHint[]>(
          OK.usePracticeSentenceVocabularyHints(sentenceId),
          data.vocabularyHints
        );
      }
    },
  });

  return {
    mutateAsync: mutation.mutateAsync as (params?: {
      targetLanguage?: "EN" | "ZH" | "KO";
      onTextChunk?: (fullText: string) => void;
      onPartialHints?: (partial: VocabularyHint[]) => void;
    }) => Promise<ParagraphSentence>,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export function useCommunityTranslations(
  sentenceId: number,
  enabled: boolean,
  score: CommunityScoreBand,
  targetLanguage: "EN" | "ZH" | "KO",
) {
  return useQuery<CommunityTranslation[]>({
    queryKey: OK.communityTranslations(sentenceId, score, targetLanguage),
    queryFn: () => getCommunityTranslations(sentenceId, score, targetLanguage),
    enabled: enabled && sentenceId > 0,
    staleTime: 60_000,
  });
}