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
    mutationFn: () => getSentenceVocabularyHints(sentenceId),
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
    mutateAsync: mutation.mutateAsync as () => Promise<ParagraphSentence>,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export function useCommunityTranslations(
  sentenceId: number,
  enabled: boolean,
  score: CommunityScoreBand,
) {
  return useQuery<CommunityTranslation[]>({
    queryKey: OK.communityTranslations(sentenceId, score),
    queryFn: () => getCommunityTranslations(sentenceId, score),
    enabled: enabled && sentenceId > 0,
    staleTime: 60_000,
  });
}