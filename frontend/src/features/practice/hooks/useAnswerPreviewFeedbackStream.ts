import { useCallback, useRef, useState } from "react";
import type { AnswerPreviewInput } from "../schema";
import { streamAnswerPreviewMarkdown } from "../api";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";

type UseAnswerPreviewFeedbackStreamResult = {
  feedback: SentenceFeedback | null;
  isStreaming: boolean;
  error: unknown;
  start: () => Promise<void>;
  reset: () => void;
};

function parsePartialFeedback(
  raw: string,
): Partial<SentenceFeedback> | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as SentenceFeedback;
    return parsed;
  } catch {
    // Nếu chưa phải JSON hợp lệ thì thử tách từng field bằng regex.
  }

  const result: Partial<SentenceFeedback> = {};

  const correctionMatch = trimmed.match(/"correction"\s*:\s*"([^"]*)/);
  if (correctionMatch) {
    result.correction = correctionMatch[1];
  }

  const suggestionsBlockMatch = trimmed.match(
    /"suggestions"\s*:\s*\[(.*?)\]/s,
  );
  if (suggestionsBlockMatch) {
    const rawItems = suggestionsBlockMatch[1];
    const items = rawItems
      .split(/",(?:\s*)"/)
      .map((s) => s.replace(/^"/, "").replace(/"$/, ""))
      .filter(Boolean);
    if (items.length) {
      result.suggestions = items;
    }
  }

  const summaryMatch = trimmed.match(/"summary"\s*:\s*"([^"]*)/);
  if (summaryMatch) {
    result.summary = summaryMatch[1];
  }

  const scoreMatch = trimmed.match(/"score"\s*:\s*([0-9]+(?:\.[0-9]+)?)/);
  if (scoreMatch) {
    result.score = Number(scoreMatch[1]);
  }

  if (
    result.correction ||
    result.suggestions ||
    result.summary ||
    typeof result.score === "number"
  ) {
    return result;
  }

  return null;
}

export function useAnswerPreviewFeedbackStream(
  id: number,
  payload: AnswerPreviewInput,
): UseAnswerPreviewFeedbackStreamResult {
  const [feedback, setFeedback] =
    useState<SentenceFeedback | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setFeedback(null);
    setIsStreaming(false);
    setError(null);
  }, []);

  const start = useCallback(async () => {
    if (!id) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setFeedback(null);
    setIsStreaming(true);
    setError(null);

    let buffer = "";

    try {
      await streamAnswerPreviewMarkdown(
        id,
        payload,
        (chunk) => {
          buffer += chunk;

          const partial = parsePartialFeedback(buffer);
          if (partial) {
            setFeedback((prev) => ({
              correction: prev?.correction ?? "",
              suggestions: prev?.suggestions ?? [],
              summary: prev?.summary ?? "",
              score: prev?.score ?? 0,
              ...partial,
            }));
          }
        },
        controller.signal,
      );

      try {
        const trimmed = buffer.trim();
        if (trimmed) {
          const parsed = JSON.parse(trimmed) as SentenceFeedback;
          setFeedback(parsed);
        }
      } catch {
        // giữ nguyên feedback đã parse từng phần
      }
    } catch (err) {
      if (!controller.signal.aborted) {
        setError(err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsStreaming(false);
      }
    }
  }, [id, payload]);

  return {
    feedback,
    isStreaming,
    error,
    start,
    reset,
  };
}

