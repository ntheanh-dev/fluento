import type { SubmitAnswerRequest, UserPractice } from "@/entities/userPractice/schema";
import { createRestClient, getResource } from "../../shared/api/rest-client";
import type { AnswerPreviewInput, PracticeSetupInput } from "./schema";
import type {
  CommunityScoreBand,
  CommunityTranslation,
  ParagraphSentence,
} from "@/entities/paragraphSentence/schema";
import type { SentenceFeedback, UserSentenceAnswer } from "@/entities/userPracticeAnswer/schema";
import type { ApiResponse } from "@/shared/api/type";
import Cookies from "js-cookie";
import { getRuntimeEnv } from "@/shared/config/runtime-env";
import { ACCESS_TOKEN_EXPIRE_TIME } from "@/features/auth/constant";

const BASE = "/user-practices";
const PARAGRAPH_SENTENCE_BASE = "/paragraphSentence";
const runtimeEnv = getRuntimeEnv();
const API_BASE_URL = runtimeEnv.VITE_API_URL || import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const refreshAccessTokenForStream = async (): Promise<string> => {
  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  if (!res.ok) {
    throw new Error("Refresh token request failed");
  }

  const json = await res.json() as { result?: { accessToken?: string } };
  const accessToken = json?.result?.accessToken;
  if (!accessToken) {
    throw new Error("Invalid refresh response");
  }

  Cookies.set("accessToken", accessToken, {
    expires: ACCESS_TOKEN_EXPIRE_TIME,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return accessToken;
};

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

export const getSentenceVocabularyHints = (
  sentenceId: number,
): Promise<ParagraphSentence> => {
  return getResource<ParagraphSentence>(
    PARAGRAPH_SENTENCE_BASE + `/${sentenceId}/vocabularyHints`,
  );
};

export const getCommunityTranslations = (
  sentenceId: number,
  score: CommunityScoreBand,
): Promise<CommunityTranslation[]> => {
  const q = new URLSearchParams({ score });
  return getResource<CommunityTranslation[]>(
    `${PARAGRAPH_SENTENCE_BASE}/${sentenceId}/communityTranslations?${q}`,
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

export const getAnswerPreview = (
  id: number,
  payload: AnswerPreviewInput,
  onTextChunk?: (fullText: string) => void,
  onPartialFeedback?: (partial: Partial<SentenceFeedback>) => void,
): Promise<SentenceFeedback> => {
  return (async () => {
    let token = Cookies.get("accessToken");
    let response = await fetch(`${API_BASE_URL}${BASE}/${id}/answers/preview`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream, application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 401) {
      token = await refreshAccessTokenForStream();
      response = await fetch(`${API_BASE_URL}${BASE}/${id}/answers/preview`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream, application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
    }

    if (!response.ok) {
      try {
        throw await response.json();
      } catch {
        throw new Error(`Preview request failed: ${response.status}`);
      }
    }

    if (!response.body) {
      throw new Error("Empty stream body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullStreamText = "";
    let lastPartialSignature = "";

    const tryParseChunkPayload = (raw: string): string | null => {
      const trimmed = raw.trim();
      if (!trimmed) return null;
      if (trimmed === "[DONE]") return null;
      try {
        const parsed = JSON.parse(trimmed) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        return parsed.choices?.[0]?.delta?.content ?? null;
      } catch {
        return null;
      }
    };

    const toCleanJson = (raw: string): string => {
      let text = raw.trim();
      if (text.startsWith("```")) {
        text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "");
        text = text.replace(/\s*```$/, "");
      }
      return text.trim();
    };

    const decodeJsonStringLoose = (encoded: string): string => {
      try {
        return JSON.parse(`"${encoded}"`) as string;
      } catch {
        return encoded
          .replace(/\\"/g, "\"")
          .replace(/\\n/g, "\n")
          .replace(/\\r/g, "\r")
          .replace(/\\t/g, "\t")
          .replace(/\\\\/g, "\\");
      }
    };

    const extractStringField = (raw: string, field: "correction" | "improved" | "summary", allowPartial: boolean): string | undefined => {
      const keyIdx = raw.indexOf(`"${field}"`);
      if (keyIdx < 0) return undefined;
      const colonIdx = raw.indexOf(":", keyIdx);
      if (colonIdx < 0) return undefined;
      const quoteStart = raw.indexOf("\"", colonIdx);
      if (quoteStart < 0) return undefined;

      let escaped = false;
      let value = "";
      for (let i = quoteStart + 1; i < raw.length; i += 1) {
        const ch = raw[i];
        if (escaped) {
          value += `\\${ch}`;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === "\"") {
          return decodeJsonStringLoose(value);
        }
        value += ch;
      }
      return allowPartial ? decodeJsonStringLoose(value) : undefined;
    };

    const extractSuggestions = (raw: string, allowPartial: boolean): string[] | undefined => {
      const keyIdx = raw.indexOf("\"suggestions\"");
      if (keyIdx < 0) return undefined;
      const bracketStart = raw.indexOf("[", keyIdx);
      if (bracketStart < 0) return undefined;

      const out: string[] = [];
      let inString = false;
      let escaped = false;
      let current = "";

      for (let i = bracketStart + 1; i < raw.length; i += 1) {
        const ch = raw[i];
        if (!inString) {
          if (ch === "]") return out;
          if (ch === "\"") {
            inString = true;
            current = "";
          }
          continue;
        }

        if (escaped) {
          current += `\\${ch}`;
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === "\"") {
          inString = false;
          out.push(decodeJsonStringLoose(current));
          continue;
        }
        current += ch;
      }

      if (allowPartial && inString && current.length > 0) {
        out.push(decodeJsonStringLoose(current));
      }
      return out.length > 0 ? out : allowPartial ? [] : undefined;
    };

    const extractScore = (raw: string): number | undefined => {
      const match = raw.match(/"score"\s*:\s*(-?\d+(?:\.\d+)?)/);
      if (!match) return undefined;
      const n = Number(match[1]);
      return Number.isFinite(n) ? n : undefined;
    };

    const parseSentenceFeedbackFromStream = (raw: string, allowPartial: boolean): Partial<SentenceFeedback> => {
      const text = toCleanJson(raw);
      const partial: Partial<SentenceFeedback> = {};
      const correction = extractStringField(text, "correction", allowPartial);
      const improved = extractStringField(text, "improved", allowPartial);
      const summary = extractStringField(text, "summary", allowPartial);
      const suggestions = extractSuggestions(text, allowPartial);
      const score = extractScore(text);

      if (correction !== undefined) partial.correction = correction;
      if (improved !== undefined) partial.improved = improved;
      if (summary !== undefined) partial.summary = summary;
      if (suggestions !== undefined) partial.suggestions = suggestions;
      if (score !== undefined) partial.score = score;
      return partial;
    };

    const isCompleteSentenceFeedback = (value: Partial<SentenceFeedback>): value is SentenceFeedback => (
      typeof value.correction === "string"
      && typeof value.improved === "string"
      && Array.isArray(value.suggestions)
      && value.suggestions.every((item) => typeof item === "string")
      && typeof value.summary === "string"
      && typeof value.score === "number"
    );

    const pushPartialFeedback = () => {
      if (!onPartialFeedback) return;
      const partial = parseSentenceFeedbackFromStream(fullStreamText, true);
      const signature = JSON.stringify(partial);
      if (signature === "{}" || signature === lastPartialSignature) return;
      lastPartialSignature = signature;
      if (
        partial.correction !== undefined
        || partial.improved !== undefined
        || partial.summary !== undefined
        || partial.score !== undefined
        || partial.suggestions !== undefined
      ) {
        onPartialFeedback(partial);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const sseBlocks = buffer.split("\n\n");
      buffer = sseBlocks.pop() ?? "";

      for (const block of sseBlocks) {
        const dataLines = block
          .split("\n")
          .filter((line) => line.startsWith("data:"))
          // Keep exact stream payload (including leading spaces),
          // otherwise tokens like " " are lost and words get glued together.
          .map((line) => line.slice(5));
        const ssePayload = dataLines.join("\n");

        if (ssePayload) {
          try {
            const parsed = JSON.parse(ssePayload) as ApiResponse<SentenceFeedback>;
            if (parsed?.result) {
              return parsed.result;
            }
          } catch {
            // Ignore JSON parse failure, handled below as stream chunk.
          }

          const content = tryParseChunkPayload(ssePayload);
          if (content != null) {
            fullStreamText += content;
            onTextChunk?.(fullStreamText);
            pushPartialFeedback();
          } else {
            fullStreamText += ssePayload;
            onTextChunk?.(fullStreamText);
            pushPartialFeedback();
          }
          continue;
        }

        // Raw chunk line mode (without SSE data prefix).
        const content = tryParseChunkPayload(block);
        if (content != null) {
          fullStreamText += content;
          onTextChunk?.(fullStreamText);
          pushPartialFeedback();
        }
      }
    }

    if (fullStreamText.trim()) {
      const strictParsed = parseSentenceFeedbackFromStream(fullStreamText, false);
      if (isCompleteSentenceFeedback(strictParsed)) {
        return strictParsed;
      }
      return JSON.parse(toCleanJson(fullStreamText)) as SentenceFeedback;
    }

    throw new Error("No feedback stream content received");
  })();
};