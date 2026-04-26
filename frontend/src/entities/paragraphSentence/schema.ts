export interface ParagraphSentence {
  id: number;
  orderIndex: number;
  content: string;
  vocabularyHints?: VocabularyHint[] | null;
}

export interface VocabularyHint {
  sourceText: string;
  translations: Vocabulary[];
}

export interface Vocabulary {
  text: string;
  partsOfSpeech: string;
  pronunciation: string;
}

/** Khớp query param `score` trên GET communityTranslations. */
export type CommunityScoreBand = "LE7" | "RANGE_7_8" | "GE8";

/** Bản dịch tiếng Anh do học viên khác đã nộp cho cùng câu (cùng đoạn + orderIndex). */
export interface CommunityTranslation {
  translatorName?: string | null;
  translation: string;
  score: number | null;
  submittedAt: string | null;
}