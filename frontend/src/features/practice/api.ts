import { createRestClient } from "../../shared/api/rest-client";
import type { PracticeSetupInput, PracticeSetupOutput } from "./schema";

const BASE = "/user-practice";

export const createUserPractice = (payload: PracticeSetupInput): Promise<PracticeSetupOutput> => {
    return createRestClient<PracticeSetupOutput>(BASE, payload);
};