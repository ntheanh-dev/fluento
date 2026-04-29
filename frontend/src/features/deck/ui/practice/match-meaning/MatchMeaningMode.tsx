import { useEffect, useMemo, useRef, useState } from "react";
import matchCorrectSound from "@/assets/audio/match-correct.mp3";
import matchWrongSound from "@/assets/audio/match-wrong.mp3";
import type { PracticeWord } from "../shared/types";

type MatchMeaningModeProps = {
  words: PracticeWord[];
  sourceLabel: string;
  targetLabel: string;
  speakOnCorrectMatch: boolean;
  speakLanguage?: string;
  swapColumns: boolean;
  onMatchedCountChange?: (count: number, total: number) => void;
};

export function MatchMeaningMode({
  words,
  sourceLabel,
  targetLabel,
  speakOnCorrectMatch,
  speakLanguage,
  swapColumns,
  onMatchedCountChange,
}: MatchMeaningModeProps) {
  const listContainerRef = useRef<HTMLDivElement | null>(null);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);
  const wrongAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedWordId, setSelectedWordId] = useState<number | null>(null);
  const [selectedMeaningId, setSelectedMeaningId] = useState<number | null>(null);
  const [matchedWordIds, setMatchedWordIds] = useState<Set<number>>(new Set());
  const [matchedMeaningIds, setMatchedMeaningIds] = useState<Set<number>>(new Set());
  const [matchedPairs, setMatchedPairs] = useState<Array<{ wordId: number; meaningId: number }>>([]);
  const [linePaths, setLinePaths] = useState<string[]>([]);
  const [wrongWordId, setWrongWordId] = useState<number | null>(null);
  const [wrongMeaningId, setWrongMeaningId] = useState<number | null>(null);
  const rows = useMemo(() => {
    const baseRows = words;
    if (baseRows.length <= 1) return baseRows;
    const arr = [...baseRows];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [words]);

  const normalizeMeaning = (value: string) => value.trim().toLowerCase();

  const shuffledMeanings = useMemo(() => {
    if (rows.length <= 1) return rows;
    const arr = [...rows];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [rows]);

  useEffect(() => {
    onMatchedCountChange?.(matchedWordIds.size, rows.length);
  }, [matchedWordIds.size, onMatchedCountChange, rows.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const correctAudio = new Audio(matchCorrectSound);
    const wrongAudio = new Audio(matchWrongSound);
    correctAudio.preload = "auto";
    wrongAudio.preload = "auto";
    correctAudio.volume = 1;
    wrongAudio.volume = 1;
    correctAudioRef.current = correctAudio;
    wrongAudioRef.current = wrongAudio;
    return () => {
      correctAudio.pause();
      wrongAudio.pause();
      correctAudioRef.current = null;
      wrongAudioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const computeLinePaths = () => {
      const board = boardRef.current;
      if (!board) return;
      const boardRect = board.getBoundingClientRect();
      const nextPaths: string[] = [];

      for (const pair of matchedPairs) {
        const wordEl = document.getElementById(`match-word-${pair.wordId}`);
        const meaningEl = document.getElementById(`match-meaning-${pair.meaningId}`);
        if (!wordEl || !meaningEl) continue;

        const wordRect = wordEl.getBoundingClientRect();
        const meaningRect = meaningEl.getBoundingClientRect();
        const wordCenterY = wordRect.top - boardRect.top + wordRect.height / 2;
        const meaningCenterY = meaningRect.top - boardRect.top + meaningRect.height / 2;

        const fromIsLeft = wordRect.left <= meaningRect.left;
        const startX = fromIsLeft ? wordRect.right - boardRect.left : wordRect.left - boardRect.left;
        const endX = fromIsLeft ? meaningRect.left - boardRect.left : meaningRect.right - boardRect.left;

        const deltaX = Math.abs(endX - startX);
        const controlOffset = Math.max(28, Math.min(120, deltaX * 0.35));
        const c1x = fromIsLeft ? startX + controlOffset : startX - controlOffset;
        const c2x = fromIsLeft ? endX - controlOffset : endX + controlOffset;
        nextPaths.push(`M ${startX} ${wordCenterY} C ${c1x} ${wordCenterY}, ${c2x} ${meaningCenterY}, ${endX} ${meaningCenterY}`);
      }

      setLinePaths(nextPaths);
    };

    const requestCompute = () => {
      window.requestAnimationFrame(() => {
        computeLinePaths();
      });
    };

    requestCompute();
    const container = listContainerRef.current;
    container?.addEventListener("scroll", requestCompute, { passive: true });
    window.addEventListener("resize", requestCompute);
    return () => {
      container?.removeEventListener("scroll", requestCompute);
      window.removeEventListener("resize", requestCompute);
    };
  }, [matchedPairs, swapColumns]);

  const speakWord = (value: string) => {
    if (!speakOnCorrectMatch || typeof window === "undefined" || typeof window.speechSynthesis === "undefined") return;
    const trimmed = value.trim();
    if (!trimmed) return;
    const utterance = new SpeechSynthesisUtterance(trimmed);
    if (speakLanguage) utterance.lang = speakLanguage;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const playFeedbackTone = (type: "correct" | "wrong") => {
    const audio = type === "correct" ? correctAudioRef.current : wrongAudioRef.current;
    if (!audio) return;
    audio.volume = 1;
    audio.currentTime = 0;
    audio.play().catch(() => undefined);
  };

  const handleMatch = (wordId: number, meaningId: number) => {
    if (matchedWordIds.has(wordId) || matchedMeaningIds.has(meaningId)) return;
    const selectedWord = rows.find((row) => row.id === wordId);
    const pickedMeaning = shuffledMeanings.find((row) => row.id === meaningId);
    if (!selectedWord || !pickedMeaning) return;

    const isCorrect = normalizeMeaning(selectedWord.meaning) === normalizeMeaning(pickedMeaning.meaning);
    if (isCorrect) {
      playFeedbackTone("correct");
      setMatchedWordIds((prev) => {
        const next = new Set(prev);
        next.add(wordId);
        return next;
      });
      setMatchedMeaningIds((prev) => {
        const next = new Set(prev);
        next.add(meaningId);
        return next;
      });
      setMatchedPairs((prev) => [...prev, { wordId, meaningId }]);
      speakWord(selectedWord.text);
      setSelectedWordId(null);
      setSelectedMeaningId(null);
      setWrongWordId(null);
      setWrongMeaningId(null);
      return;
    }
    playFeedbackTone("wrong");
    setWrongWordId(wordId);
    setWrongMeaningId(meaningId);
    setTimeout(() => {
      setWrongWordId(null);
      setWrongMeaningId(null);
      setSelectedWordId(null);
      setSelectedMeaningId(null);
    }, 500);
  };

  const sourceColumn = (
    <div className="space-y-2.5 sm:space-y-3">
      {rows.map((row) => (
        <button
          type="button"
          id={`match-word-${row.id}`}
          key={row.id}
          className={`relative z-10 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-medium transition sm:text-xl ${matchedWordIds.has(row.id)
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : wrongWordId === row.id
                ? "border-red-300 bg-red-50 text-red-700"
                : selectedWordId === row.id
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
            }`}
          onClick={() => {
            if (matchedWordIds.has(row.id)) return;
            if (selectedMeaningId != null) {
              handleMatch(row.id, selectedMeaningId);
              return;
            }
            setSelectedWordId((prev) => (prev === row.id ? null : row.id));
            setWrongWordId(null);
            setWrongMeaningId(null);
          }}
        >
          <span className="whitespace-normal break-all text-left leading-snug sm:break-words">{row.text}</span>
        </button>
      ))}
    </div>
  );

  const meaningColumn = (
    <div className="space-y-2.5 sm:space-y-3">
      {shuffledMeanings.map((row) => (
        <button
          type="button"
          id={`match-meaning-${row.id}`}
          key={`meaning-${row.id}`}
          className={`relative z-10 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs font-semibold transition sm:text-lg ${matchedMeaningIds.has(row.id)
              ? "border-emerald-400 bg-emerald-50 text-emerald-700"
              : wrongMeaningId === row.id
                ? "border-red-300 bg-red-50 text-red-700"
                : selectedMeaningId === row.id
                  ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-500"
            }`}
          onClick={() => {
            if (matchedMeaningIds.has(row.id)) return;
            if (selectedWordId != null) {
              handleMatch(selectedWordId, row.id);
              return;
            }
            setSelectedMeaningId((prev) => (prev === row.id ? null : row.id));
            setWrongWordId(null);
            setWrongMeaningId(null);
          }}
        >
          <span className="whitespace-normal break-all text-left leading-snug sm:break-words">{row.meaning}</span>
        </button>
      ))}
    </div>
  );

  const leftHeaderLabel = swapColumns ? targetLabel : sourceLabel;
  const rightHeaderLabel = swapColumns ? sourceLabel : targetLabel;

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-1 flex-col gap-3">
      <div ref={listContainerRef} className="min-h-0 flex-1 overflow-y-auto rounded-[30px] bg-[#f7f8ff] p-4 shadow-sm dark:bg-slate-900 sm:p-6">
        <div className="mb-3 grid grid-cols-2 gap-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400 sm:mb-4">
          <p>{leftHeaderLabel}</p>
          <p>{rightHeaderLabel}</p>
        </div>
        <div ref={boardRef} className="relative">
          <svg className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible" aria-hidden="true">
            {linePaths.map((path, idx) => (
              <path key={`match-line-${idx}`} d={path} stroke="#111827" strokeWidth={2} fill="none" />
            ))}
          </svg>
          <div className="grid grid-cols-2 gap-16 md:gap-24">
            {swapColumns ? meaningColumn : sourceColumn}
            {swapColumns ? sourceColumn : meaningColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
