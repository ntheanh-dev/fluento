import { diffChars, diffWords } from "diff";
import type { ReactNode } from "react";
import type { TargetLanguage } from "@/shared/constants/target-language";

export function renderBacktickHighlight(text: string) {
  const regex = /`([^`]*)`|'([^']*)'/g;
  const result: ReactNode[] = [];

  let lastIndex = 0;

  for (const match of text.matchAll(regex)) {
    const start = match.index!;
    const end = start + match[0].length;

    if (start > lastIndex) {
      result.push(<span key={lastIndex}>{text.slice(lastIndex, start)}</span>);
    }

    const highlightedText = match[1] ?? match[2];
    result.push(
      <span key={start} className="font-semibold text-amber-400">
        {highlightedText}
      </span>,
    );

    lastIndex = end;
  }

  if (lastIndex < text.length) {
    result.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return result;
}

export function renderWordDiff(oldText: string, newText: string, targetLanguage: TargetLanguage = "EN") {
  const isCharDiffLanguage = targetLanguage === "ZH" || targetLanguage === "KO";
  const changes = isCharDiffLanguage ? diffChars(oldText, newText) : diffWords(oldText, newText);
  return changes.map((part, index) => {
    const spacer = isCharDiffLanguage ? "" : " ";
    if (part.added) {
      return (
        <span key={index} className="text-green-600 font-medium">
          {part.value}
          {spacer}
        </span>
      );
    }
    if (part.removed) {
      return (
        <>
          <span key={index} className="text-red-500 line-through">
            {part.value}
          </span>
          {spacer}
        </>
      );
    }
    return (
      <span key={index}>
        {part.value}
        {spacer}
      </span>
    );
  });
}

export function aiScoreCircleClass(score: number): string {
  if (score >= 8) {
    return "bg-emerald-500 text-white shadow-[0_1px_2px_rgba(16,185,129,0.45)] ring-2 ring-emerald-200/90 dark:bg-emerald-600 dark:ring-emerald-900/50";
  }
  if (score >= 6.5) {
    return "bg-blue-500 text-white shadow-[0_1px_2px_rgba(59,130,246,0.45)] ring-2 ring-blue-200/90 dark:bg-blue-600 dark:ring-blue-900/50";
  }
  if (score >= 5) {
    return "bg-amber-500 text-white shadow-[0_1px_2px_rgba(245,158,11,0.45)] ring-2 ring-amber-200/90 dark:bg-amber-600 dark:ring-amber-900/50";
  }
  if (score >= 3.5) {
    return "bg-orange-500 text-white shadow-[0_1px_2px_rgba(249,115,22,0.45)] ring-2 ring-orange-200/90 dark:bg-orange-600 dark:ring-orange-900/50";
  }
  return "bg-red-500 text-white shadow-[0_1px_2px_rgba(239,68,68,0.45)] ring-2 ring-red-200/90 dark:bg-red-600 dark:ring-red-900/50";
}

export function getVocabularyTypeColor(type: string): string {
  switch (type) {
    case "verb":
      return "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400";
    case "noun":
      return "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400";
    case "noun phrase":
      return "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400";
    case "noun clause":
      return "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400";
    case "adjective":
      return "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400";
    case "adverb":
    case "adverb phrase":
    case "adverb clause":
    case "adverbial phrase":
    case "modal verb":
      return "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400";
    case "determiner":
      return "bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400";
    case "relative pronoun":
    case "gerund phrase":
    case "gerund":
      return "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400";
    case "relative adverb":
    case "relative adverb phrase":
    case "verb phrase":
      return "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400";
    case "relative adjective":
      return "bg-yellow-50 text-yellow-600 dark:bg-yellow-950/50 dark:text-yellow-400";
    case "relative adverb clause":
      return "bg-pink-50 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400";
    case "preposition":
    case "preposition phrase":
    case "prepositional phrase":
      return "bg-teal-50 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400";
    case "conjunction":
      return "bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400";
    case "pronoun":
      return "bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "bg-gray-50 text-gray-600 dark:bg-gray-900/50 dark:text-gray-400";
  }
}

export function isStableChunk(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  return /[.!?。！？]$/.test(trimmed);
}

export function splitStableAndPendingText(value: string, isStreaming: boolean): { stable: string; pending: string } {
  if (!isStreaming) {
    return { stable: value, pending: "" };
  }
  const normalized = value ?? "";
  if (!normalized) {
    return { stable: "", pending: "" };
  }
  if (isStableChunk(normalized)) {
    return { stable: normalized, pending: "" };
  }

  const match = normalized.match(/^(.*[.!?。！？]\s*)([^.!?。！？]*)$/s);
  if (!match) {
    return { stable: "", pending: normalized };
  }

  return {
    stable: match[1] ?? "",
    pending: match[2] ?? "",
  };
}


