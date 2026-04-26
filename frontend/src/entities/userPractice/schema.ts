import type { Paragraph } from "../paragraph/schema";
import type { SentenceFeedback, UserSentenceAnswer } from "../userPracticeAnswer/schema";

export interface UserPractice {
    id: number;
    attemptNumber: number;
    score: number;
    learningTime: number;
    targetLanguage: "EN" | "ZH" | "KO";
    createdAt: string;
    paragraph: Paragraph;
    sentenceAnswers: UserSentenceAnswer[];
  }

export interface SubmitAnswerRequest {
  vietnameseSentence: string;
  orderIndex: number;
  feedback: SentenceFeedback;
  /** Time spent in ms (optional, sent when submitting last sentence) */
  learningTime?: number;
}