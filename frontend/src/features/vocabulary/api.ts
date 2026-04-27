import {
  deleteResource,
  updateRestClient,
} from "@/shared/api/rest-client";
import type { VocabularyItem } from "@/features/deck/schema";
import type { UpdateVocabularyPayload } from "./schema";

const VOCABULARY_BASE = "/vocabularies";

export const updateVocabulary = (
  vocabularyId: number,
  payload: UpdateVocabularyPayload,
): Promise<VocabularyItem> => {
  return updateRestClient<VocabularyItem>(
    `${VOCABULARY_BASE}/${vocabularyId}`,
    payload,
  );
};

export const deleteVocabulary = (
  vocabularyId: number,
): Promise<void> => {
  return deleteResource(`${VOCABULARY_BASE}/${vocabularyId}`);
};
