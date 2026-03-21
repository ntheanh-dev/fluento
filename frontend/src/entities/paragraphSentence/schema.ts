export interface ParagraphSentence {
  id: number;
  orderIndex: number;
  content: string;
  vocabularyHints?: VocabularyHint[] | null;
}

export interface VocabularyHint {
  vietnamese: string;
  english: Vocabulary[];
}

export interface Vocabulary {
  english: string;
  partsOfSpeech: string;
  ipaPronunciation: string;
}