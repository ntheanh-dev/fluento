import type { VocabularyItem } from "@/features/deck/schema";

export type PracticeWord = {
  id: number;
  text: string;
  meaning: string;
  pronunciation: string;
  partOfSpeech: string;
};

export function toPracticeWords(vocabularies: VocabularyItem[]): PracticeWord[] {
  return vocabularies.map((item, idx) => ({
    id: item.id,
    text: item.text,
    meaning: item.meaning?.trim() || `Nghia cua "${item.text}"`,
    pronunciation: item.pronunciation?.trim() || "/.../",
    partOfSpeech: item.partOfSpeech?.trim().toUpperCase() || (idx % 2 === 0 ? "NOUN" : "VERB"),
  }));
}
