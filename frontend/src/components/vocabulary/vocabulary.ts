// Anki System Types

export interface Deck {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
  cardCount: number;
}

export interface NoteType {
  id: number;
  name: string;
  userId: number;
  createdAt: string;
  fields: Field[];
  noteCount: number;
}

export interface Field {
  id: number;
  name: string;
  fieldOrder: number;
  isRequired: boolean;
}

export interface Note {
  id: number;
  noteTypeId: number;
  deckId: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  fieldValues: Record<string, string>;
  cards: Card[];
}

export interface Card {
  id: number;
  noteId: number;
  cardType: 'BASIC' | 'CLOZE' | 'REVERSE';
  frontTemplate: string;
  backTemplate: string;
  createdAt: string;
  fieldValues?: Record<string, string>; // Field values for template rendering
  stats?: CardStats;
}

export interface CardStats {
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  lapses: number;
  dueDate: string;
  lastReviewedAt?: string;
}

export interface Review {
  id: number;
  cardId: number;
  userId: number;
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  easeFactor: number;
  intervalDays: number;
  repetitions: number;
  dueDate: string;
  reviewTimeMs: number;
  createdAt: string;
}

export interface StudySession {
  totalCards: number;
  dueCards: number;
  newCards: number;
  reviewCards: number;
  cardsToStudy: Card[];
  stats: StudyStats;
}

export interface StudyStats {
  totalCards: number;
  learnedCards: number;
  dueToday: number;
  newToday: number;
  reviewToday: number;
}

// Request DTOs
export interface CreateDeckRequest {
  name: string;
}

export interface CreateNoteTypeRequest {
  name: string;
  fields: CreateFieldRequest[];
}

export interface CreateFieldRequest {
  name: string;
  fieldOrder?: number;
  isRequired?: boolean;
}

export interface CreateNoteRequest {
  noteTypeId: number;
  deckId: number;
  fieldValues: Record<string, string | File>;
}

export interface ReviewCardRequest {
  cardId: number;
  rating: 'AGAIN' | 'HARD' | 'GOOD' | 'EASY';
  reviewTimeMs: number;
}

export type StudyMode = 'FLASHCARD' | 'GUESS_TYPE';

export interface StudyModeStats {
  totalVocabulary: number;
  mastered: number;
  dueForReview: number;
  masteryPercentage: number;
  difficultyDistribution: {
    known: number;
    easy: number;
    medium: number;
    hard: number;
    notStarted: number;
  };
}

