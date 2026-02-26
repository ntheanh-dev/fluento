import { createRestClient, getResource } from "../../shared/api/rest-client";
import type { PracticeSetupInput, PracticeSetupOutput } from "./schema";

const BASE = "/user-practices";

export const createUserPractice = (
  payload: PracticeSetupInput,
): Promise<PracticeSetupOutput> => {
  return createRestClient<PracticeSetupOutput>(BASE, payload);
};

export const getUserPracticeById = (
  id: number,
): Promise<PracticeSetupOutput> => {
  return getResource<PracticeSetupOutput>(BASE + `/${id}`);
};
