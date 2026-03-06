// Common API response interface
export interface ApiResponse<T = any> {
  code: number;
  result: T;
}

// Common API error interface
export interface ApiError {
  message: string;
  code?: number;
  details?: any;
}

// Generic API response wrapper
export interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// Common pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// Common paginated response
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationParams;
}

// Translation hints response types
export interface VocabularyHint {
  vietnamese: string;
  english: string[];
}

export interface TranslationHintsResponse {
  vocabularyHints: VocabularyHint[];
}

// Translation check response types
export interface SpellingMistake {
  word: string;
  suggestion: string;
}

export interface GrammarError {
  issue: string;
  example: string;
}

export interface VocabularyIssue {
  word: string;
  suggestion: string[];
}

export interface SentenceStructure {
  problem: string;
  suggestion: string;
}

export interface TranslationFeedback {
  weaknesses: string[];
}

export interface TranslationCheckResponse {
  originalVietnamese: string;
  learnerEnglish: string;
  corrections: {
    spellingMistakes: SpellingMistake[];
    vocabularyIssues: VocabularyIssue[];
    grammarErrors: GrammarError[];
    sentenceStructure: SentenceStructure[];
  };
  feedback: TranslationFeedback;
  score: number;
  improvedTranslation: string;
}

export interface SentenceCreationResponse {
  vietnamese : string;
  englishTranslation : string;
  orderIndex: number;
  score: number;
  feedback: string
  conversationId: string;
}

export interface Sentence {
  englishTranslation: string;
  vietnamese: string;
  score: number;
  feedback: string;
}