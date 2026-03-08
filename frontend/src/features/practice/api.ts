import type { SubmitAnswerRequest, UserPractice } from "@/entities/userPractice/schema";
import { createRestClient, getResource } from "../../shared/api/rest-client";
import type { AnswerPreviewInput, PracticeSetupInput } from "./schema";
import type { HintContent } from "@/entities/hints/schema";
import type { UserSentenceAnswer } from "@/entities/userPracticeAnswer/schema";
import Cookies from "js-cookie";

const BASE = "/user-practices";
const PARAGRAPH_BASE = "/paragraphs";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api";
export const createUserPractice = (
  payload: PracticeSetupInput,
): Promise<UserPractice> => {
  return createRestClient<UserPractice>(BASE, payload);
};

export const getUserPracticeById = (
  id: number,
): Promise<UserPractice> => {
  return getResource<UserPractice>(BASE + `/${id}`);
};

export const getParagraphHints = (
  id: number,
  orderIndex: number,
): Promise<HintContent> => {
  return getResource<HintContent>(
    PARAGRAPH_BASE + `/${id}/hints/${orderIndex}`,
  );
};

export const submitUserSentence = (
  id: number,
  payload: SubmitAnswerRequest,
): Promise<UserSentenceAnswer> => {
  return createRestClient<UserSentenceAnswer>(
    BASE + `/${id}/answers`,
    payload,
  );
};

export async function streamAnswerPreviewMarkdown(
  id: number,
  payload: AnswerPreviewInput,
  onChunk: (chunk: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const token = Cookies.get("accessToken");

  const response = await fetch(
    `${API_BASE_URL}${BASE}/${id}/answers/preview/stream-markdown`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      credentials: "include",
      body: JSON.stringify(payload),
      signal,
    },
  );

  if (!response.ok) {
    let body: { message?: string; code?: number } = {};
    try {
      const text = await response.text();
      if (text) body = JSON.parse(text) as { message?: string; code?: number };
    } catch {
      // ignore parse error
    }
    const err = new Error(body?.message ?? "Failed to stream answer preview") as Error & {
      response?: { data: { message?: string; code?: number } };
    };
    err.response = { data: body };
    throw err;
  }

  if (!response.body) {
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    if (value) {
      const text = decoder.decode(value, { stream: !readerDone });
      if (text) {
        onChunk(text);
      }
    }
    done = readerDone;
  }
}