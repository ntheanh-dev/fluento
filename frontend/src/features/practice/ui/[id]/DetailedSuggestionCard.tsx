import { Copy, Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { DetailedSuggestionCardProps } from "../../schema";
import {
  isStableChunk,
  renderBacktickHighlight,
  renderWordDiff,
  splitStableAndPendingText,
} from "../../utilities";

export function DetailedSuggestionCard({
  feedback,
  userTranslation,
  isStreaming = false,
  targetLanguage,
}: DetailedSuggestionCardProps) {
  const { t } = useTranslation();
  const [expandState, setExpandState] = useState<"idle" | "loading" | "streaming" | "done">("idle");
  const [displayedExpandedText, setDisplayedExpandedText] = useState("");
  const loadingTimeoutRef = useRef<number | null>(null);
  const streamIntervalRef = useRef<number | null>(null);
  if (!feedback) {
    return <></>;
  }

  const { correction, suggestions, summary, score, improved } = feedback;
  const suggestionItems = suggestions ?? [];
  const clearExpandTimers = () => {
    if (loadingTimeoutRef.current != null) {
      window.clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    if (streamIntervalRef.current != null) {
      window.clearInterval(streamIntervalRef.current);
      streamIntervalRef.current = null;
    }
  };

  useEffect(() => {
    clearExpandTimers();
    setExpandState("idle");
    setDisplayedExpandedText("");
    return () => {
      clearExpandTimers();
    };
  }, [improved]);

  const handleExpandSentence = () => {
    if (!improved || expandState !== "idle") return;
    setExpandState("loading");
    setDisplayedExpandedText("");

    loadingTimeoutRef.current = window.setTimeout(() => {
      setExpandState("streaming");
      let cursor = 0;
      streamIntervalRef.current = window.setInterval(() => {
        if (!improved) {
          clearExpandTimers();
          setExpandState("done");
          return;
        }
        const step = Math.min(3, improved.length - cursor);
        cursor += step;
        setDisplayedExpandedText(improved.slice(0, cursor));
        if (cursor >= improved.length) {
          clearExpandTimers();
          setExpandState("done");
        }
      }, 40);
    }, 700);
  };
  return (
    <div className="flex flex-col p-4 gap-4 text-[11px] leading-relaxed text-slate-800 dark:text-slate-100 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
      {/* Score chip */}
      {typeof score === "number" && (
        <div className="flex items-center gap-2 text-[10px]">
          <div className="relative size-9">
            <svg className="size-full -rotate-90 text-slate-200 dark:text-slate-700" viewBox="0 0 36 36">
              <path
                className="text-slate-200 dark:text-slate-700"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
              <path
                className={
                  score >= 9
                    ? "text-emerald-500"
                    : score >= 7
                      ? "text-blue-500"
                      : "text-amber-500"
                }
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="currentColor"
                strokeDasharray={`${Math.min(Math.max(score * 10, 0), 100)}, 100`}
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-bold text-slate-800 dark:text-slate-100">
                {score.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-900 dark:text-slate-100">
              {t("practice.feedback.detailScore")}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {score >= 9
                ? t("practice.feedback.great")
                : score >= 7
                  ? t("practice.feedback.good")
                  : t("practice.feedback.needsWork")}
            </span>
          </div>
        </div>
      )}

      {correction != null && correction !== "" && (score == null || score < 9.5) && (
        <p className="text-[11px] font-bold text-orange-600">
          {t("practice.feedback.correctionHeading")}
          <span className="ml-1 font-semibold text-slate-800 dark:text-slate-100">
            {(() => {
              const { stable, pending } = splitStableAndPendingText(correction, isStreaming);
              if (isStreaming) {
                return (
                  <>
                    {stable && (userTranslation?.trim()
                      ? renderWordDiff(userTranslation.trim(), stable, targetLanguage)
                      : stable)}
                    {pending}
                  </>
                );
              }
              return userTranslation?.trim()
                ? renderWordDiff(userTranslation.trim(), correction, targetLanguage)
                : correction;
            })()}
          </span>
        </p>
      )}

      {/* Suggested improvements */}
      {suggestionItems.length > 0 && (
        <div>
          <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 mb-1">
            {t("practice.feedback.improvementsHeading")}
          </p>
          <ul className="space-y-1 pl-4 list-disc text-slate-700 dark:text-slate-300">
            {suggestionItems.map((item, idx) => (
              <li key={idx} className="text-[12px]">
                {isStreaming && idx === suggestionItems.length - 1 && !isStableChunk(item)
                  ? item
                  : renderBacktickHighlight(item)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className="mt-1">
          <p className="font-bold text-emerald-600 mb-1">{t("practice.feedback.commentLabel")}</p>
          <p className="text-[12px] text-slate-700 dark:text-slate-300">
            {(() => {
              const { stable, pending } = splitStableAndPendingText(summary, isStreaming);
              if (!isStreaming) {
                return renderBacktickHighlight(summary);
              }
              return (
                <>
                  {stable ? renderBacktickHighlight(stable) : null}
                  {pending}
                </>
              );
            })()}
          </p>
        </div>
      )}

      {improved && (
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-green-700 flex items-center gap-1.5 cursor-pointer hover:text-green-700 transition-colors text-underline" onClick={() => {
              handleExpandSentence();
            }} >
              <Sparkles className="size-3.5" />
              {t("practice.feedback.expandSentence")}
            </span>
            {(expandState === "streaming" || expandState === "done") && (
              <button
                className="text-green-600 hover:text-green-700 transition-colors"
                title={t("practice.feedback.copy")}
                onClick={() => navigator.clipboard.writeText(displayedExpandedText || improved)}
              >
                <Copy className="size-3.5" />
              </button>
            )}
          </div>
          {expandState === "loading" && (
            <div className="inline-flex items-center gap-2 text-[12px] text-emerald-700 dark:text-emerald-300">
              <Loader2 className="size-3.5 animate-spin" />
            </div>
          )}
          {(expandState === "streaming" || expandState === "done") && (
            <p className="text-[12px]  elaxed text-slate-800 dark:text-slate-100">
              {displayedExpandedText}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
