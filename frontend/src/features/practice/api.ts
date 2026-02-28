import type { UserPractice } from "@/entities/userPractice/schema";
import { createRestClient, getResource } from "../../shared/api/rest-client";
import type { PracticeSetupInput, PracticeSetupOutput } from "./schema";
import type { HintContent } from "@/entities/hints/schema";

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
  return getResource<HintContent>(PARAGRAPH_BASE + `/${id}/paragraph-hints/${orderIndex}`);
};