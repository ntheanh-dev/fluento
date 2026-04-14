export type ParagraphType =
  | "DIARIES"
  | "IELTS_TASK1"
  | "IELTS_TASK2"
  | "EMAIL"
  | "STORY"
  | "ESSAYS"
  | "SINGLE_SENTENCE";

export type ParagraphTone = "FORMAL" | "FRIENDLY" | "PROFESSIONAL";
export type ParagraphLevel = "A2" | "B1" | "B2" | "C1" | "C2";
export type ParagraphSentenceCount = "TEN" | "FIFTEEN" | "TWENTY" | "MAX";

export interface ParagraphItem {
  id: number;
  title: string | null;
  type: ParagraphType;
  tone: ParagraphTone;
  topic: string;
  level: ParagraphLevel;
  sentenceCount: ParagraphSentenceCount | null;
  practiceCount: number;
  createdAt: string;
  sentences: string[];
}

export interface Page<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

export interface ParagraphListParams {
  type?: string;
  tone?: string;
  topic?: string;
  level?: string;
  sentenceCount?: string;
  sort?: "asc" | "desc" | "most_practiced";
  page?: number;
  size?: number;
}
