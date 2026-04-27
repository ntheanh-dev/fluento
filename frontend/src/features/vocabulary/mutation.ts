import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteVocabulary, updateVocabulary } from "./api";
import type { UpdateVocabularyPayload } from "./schema";
import { OK } from "@/shared/api/query-keys";

type UpdateVocabularyMutationPayload = {
  deckId: number;
  vocabularyId: number;
  payload: UpdateVocabularyPayload;
};

type DeleteVocabularyMutationPayload = {
  deckId: number;
  vocabularyId: number;
};

export function useUpdateVocabularyMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      vocabularyId,
      payload,
    }: UpdateVocabularyMutationPayload) =>
      updateVocabulary(vocabularyId, payload),
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({
        queryKey: OK.myDeckDetail(variables.deckId),
      });
    },
  });
}

export function useDeleteVocabularyMutation() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ vocabularyId }: DeleteVocabularyMutationPayload) =>
      deleteVocabulary(vocabularyId),
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({
        queryKey: OK.myDeckDetail(variables.deckId),
      });
    },
  });
}
