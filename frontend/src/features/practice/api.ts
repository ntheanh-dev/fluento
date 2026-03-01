import type { SubmitAnswerRequest, UserPractice } from "@/entities/userPractice/schema";
import { createRestClient, getResource } from "../../shared/api/rest-client";
import type { AnswerPreviewInput, PracticeSetupInput, PracticeSetupOutput } from "./schema";
import type { HintContent } from "@/entities/hints/schema";
import type { SentenceFeedback, UserSentenceAnswer } from "@/entities/userPracticeAnswer/schema";

const BASE = "/user-practices";
const PARAGRAPH_BASE = "/paragraphs";
export const createUserPractice = (
  payload: PracticeSetupInput,
): Promise<PracticeSetupOutput> => {
  return createRestClient<PracticeSetupOutput>(BASE, payload);
};

export const getUserPracticeById = (
  id: number,
): Promise<UserPractice> => {
  return getResource<UserPractice>(BASE + `/${id}`);
};

export const getParagraphHints = (id: number, orderIndex: number): Promise<HintContent> => {
  return getResource<HintContent>(PARAGRAPH_BASE + `/${id}/hints/${orderIndex}`);
};

export const getAnswerPreview = (id: number, payload: AnswerPreviewInput): Promise<SentenceFeedback> => {
  return createRestClient<SentenceFeedback>(BASE + `/${id}/answers/preview`, payload);
};

export const submitUserSentence = (id: number, payload: SubmitAnswerRequest): Promise<UserSentenceAnswer> => {
  return createRestClient<UserSentenceAnswer>(BASE + `/${id}/answers`, payload);
};