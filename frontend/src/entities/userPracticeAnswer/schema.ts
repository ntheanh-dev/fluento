export interface UserSentenceAnswer {
  id: number;
  originalText: string;
  userTranslation: string;
  score: number;
  feedback: SentenceFeedback;
  createdAt: string; // ISO datetime
}

export interface SentenceFeedback {
  correction: string;
  improved: string;
  suggestions: string[];
  summary: string;
  score: number;
  coinAwarded?: number;
}