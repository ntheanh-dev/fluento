export interface UserSentenceAnswer {
    id: number;
    originalText: string;
    userTranslation: string;
    score: number;
    feedback: SentenceFeedback;
    createdAt: string; // ISO datetime
}

export interface SentenceFeedback {
    originalVietnamese: string;
    learnerEnglish: string;
    corrections: Corrections;
    feedback: Feedback;
    improvedTranslation: string;
    score: number;
  }
  
  export interface Corrections {
    spellingMistakes: SpellingMistake[];
    vocabularyIssues: VocabularyIssue[];
    grammarErrors: GrammarError[];
    sentenceStructure: SentenceStructure[];
  }
  
  export interface SpellingMistake {
    word: string;
    suggestion: string;
  }
  
  export interface VocabularyIssue {
    word: string;
    suggestion: string[];
  }
  
  export interface GrammarError {
    issue: string;
    example: string;
  }
  
  export interface SentenceStructure {
    problem: string;
    suggestion: string;
  }
  
  export interface Feedback {
    weaknesses: string[];
  }