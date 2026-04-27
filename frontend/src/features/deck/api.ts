import { createRestClient, deleteResource, getResource, updateRestClient } from "@/shared/api/rest-client";
import type {
  CreateDeckPayload,
  DeckDetail,
  DeckItem,
  SaveVocabularyToDeckPayload,
  UpdateDeckPayload,
} from "./schema";
import type { VocabularyTargetLanguage } from "@/features/vocabulary/schema";

const DECK_BASE = "/decks";

export const getMyDecks = (
  targetLanguage?: VocabularyTargetLanguage,
): Promise<DeckItem[]> => {
  const q = new URLSearchParams();
  if (targetLanguage) {
    q.set("targetLanguage", targetLanguage);
  }
  const suffix = q.toString() ? `?${q.toString()}` : "";
  return getResource<DeckItem[]>(`${DECK_BASE}${suffix}`);
};

export const createDeck = (
  payload: CreateDeckPayload,
): Promise<DeckItem> => {
  return createRestClient<DeckItem>(DECK_BASE, payload);
};

export const updateDeck = (
  deckId: number,
  payload: UpdateDeckPayload,
): Promise<DeckItem> => {
  return updateRestClient<DeckItem>(`${DECK_BASE}/${deckId}`, payload);
};

export const getMyDeckDetail = (deckId: number): Promise<DeckDetail> => {
  return getResource<DeckDetail>(`${DECK_BASE}/${deckId}`);
};

export const saveVocabularyToDeck = (
  deckId: number,
  payload: SaveVocabularyToDeckPayload,
): Promise<DeckItem> => {
  return createRestClient<DeckItem>(`${DECK_BASE}/${deckId}/vocabularies`, payload);
};

export const deleteDeck = (deckId: number): Promise<void> => {
  return deleteResource(`${DECK_BASE}/${deckId}`);
};
