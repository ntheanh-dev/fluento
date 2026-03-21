import type { ParagraphSentence } from "@/entities/paragraphSentence/schema";

export interface Paragraph {
  id: number;
  sentences: ParagraphSentence[];
  title: string;
  type: string;
  tone: string;
  topic: string;
  level: string;
  sentenceCount: string;
  createdAt: string;
}