import { useQuery } from "@tanstack/react-query";
import type { VocabularyTargetLanguage } from "@/features/vocabulary/schema";
import type { DeckDetail, DeckItem } from "./schema";
import { getMyDeckDetail, getMyDecks } from "./api";
import { OK } from "@/shared/api/query-keys";

export function useMyDecksQuery(
  targetLanguage?: VocabularyTargetLanguage,
  enabled = true,
) {
  return useQuery<DeckItem[]>({
    queryKey: OK.myDecks(targetLanguage),
    queryFn: () => getMyDecks(targetLanguage),
    enabled,
  });
}

export function useMyDeckDetailQuery(deckId: number, enabled = true) {
  return useQuery<DeckDetail>({
    queryKey: OK.myDeckDetail(deckId),
    queryFn: () => getMyDeckDetail(deckId),
    enabled,
  });
}
