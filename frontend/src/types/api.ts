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

export interface StructureHint {
  kindsOfSentencesAccordingToStructure: {
    vietnamese: string;
    english: string;
  };
  tenses: {
    vietnamese: string;
    english: string;
    form: string;
  };
}

export interface TranslationHintsResponse {
  vocabularyHints: VocabularyHint[];
  structureHints: StructureHint;
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

export interface SentenceStructure {
  problem: string;
  suggestion: string;
}

export interface TranslationFeedback {
  strengths: string[];
  weaknesses: string[];
}

export interface TranslationCheckResponse {
  originalVietnamese: string;
  learnerEnglish: string;
  corrections: {
    spellingMistakes: SpellingMistake[];
    vocabularyIssues: string[];
    grammarErrors: GrammarError[];
    sentenceStructure: SentenceStructure[];
  };
  feedback: TranslationFeedback;
  improvedTranslation: string;
}
