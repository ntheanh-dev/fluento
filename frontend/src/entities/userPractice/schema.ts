import type { Paragraph } from "../paragraph/schema";
import type { UserSentenceAnswer } from "../userPracticeAnswer/schema";

export interface UserPractice {
    id: number;
    attemptNumber: number;
    score: number;
    learningTime: number;
    createdAt: string;
    paragraph: Paragraph;
    sentenceAnswers: UserSentenceAnswer[];
  }