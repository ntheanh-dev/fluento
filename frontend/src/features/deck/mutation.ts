import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createDeck,
  deleteDeck,
  saveVocabularyToDeck,
  updateDeck,
} from "./api";
import type {
  CreateDeckPayload,
  SaveVocabularyToDeckPayload,
  UpdateDeckPayload,
} from "./schema";
import type { VocabularyTargetLanguage } from "@/features/vocabulary/schema";
import { OK } from "@/shared/api/query-keys";

type SaveVocabularyMutationPayload = {
  deckId: number;
  payload: SaveVocabularyToDeckPayload;
};

export function useCreateDeckMutation(targetLanguage?: VocabularyTargetLanguage) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateDeckPayload) => createDeck(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: OK.myDecks(targetLanguage),
      });
    },
  });
}

export function useSaveVocabularyToDeckMutation() {
  return useMutation({
    mutationFn: ({ deckId, payload }: SaveVocabularyMutationPayload) =>
      saveVocabularyToDeck(deckId, payload),
  });
}

export function useDeleteDeckMutation(targetLanguage?: VocabularyTargetLanguage) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (deckId: number) => deleteDeck(deckId),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: OK.myDecks(targetLanguage),
      });
    },
  });
}

type UpdateDeckMutationPayload = {
  deckId: number;
  payload: UpdateDeckPayload;
};

export function useUpdateDeckMutation(targetLanguage?: VocabularyTargetLanguage) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ deckId, payload }: UpdateDeckMutationPayload) => updateDeck(deckId, payload),
    onSuccess: async (_, variables) => {
      await qc.invalidateQueries({
        queryKey: OK.myDecks(targetLanguage),
      });
      await qc.invalidateQueries({
        queryKey: OK.myDeckDetail(variables.deckId),
      });
    },
  });
}
