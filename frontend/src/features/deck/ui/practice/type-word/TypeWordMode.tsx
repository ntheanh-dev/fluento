import { Button, Input } from "antd";
import type { InputRef } from "antd";
import { CheckCircle2, Lightbulb, RotateCcw, Volume2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import matchCorrectSound from "@/assets/audio/match-correct.mp3";
import type { PracticeWord } from "../shared/types";

type TypeWordModeProps = {
  word: PracticeWord;
  canKnowThis: boolean;
  speechLanguage: string;
  speakOnRender: boolean;
  speakOnCheck: boolean;
  onStillLearning: () => void;
  onKnowThis: () => void;
};

export function TypeWordMode({
  word,
  canKnowThis,
  speechLanguage,
  speakOnRender,
  speakOnCheck,
  onStillLearning,
  onKnowThis,
}: TypeWordModeProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [hintStep, setHintStep] = useState(0);
  const inputRef = useRef<InputRef | null>(null);
  const skipNextEnterRef = useRef(false);
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setValue("");
    setIsChecked(false);
    setHintStep(0);
    skipNextEnterRef.current = false;
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    const timeoutId = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [word.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const audio = new Audio(matchCorrectSound);
    audio.preload = "auto";
    audio.volume = 1;
    correctAudioRef.current = audio;
    return () => {
      audio.pause();
      correctAudioRef.current = null;
    };
  }, []);

  const shuffledAlphaIndexes = useMemo(() => {
    const chars = word.text.split("");
    const alphaIndexes = chars
      .map((ch, idx) => (/[a-z]/i.test(ch) ? idx : -1))
      .filter((idx) => idx >= 0);
    const shuffled = [...alphaIndexes];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [word.id, word.text]);

  const maskedHint = useMemo(() => {
    const chars = word.text.split("");
    const revealCount = Math.ceil((shuffledAlphaIndexes.length * hintStep) / 3);
    const revealedIndexes = new Set(shuffledAlphaIndexes.slice(0, revealCount));
    return chars
      .map((ch, idx) => {
        if (!/[a-z]/i.test(ch)) return ch;
        if (revealedIndexes.has(idx)) return ch.toLowerCase();
        return "_";
      })
      .join("");
  }, [hintStep, shuffledAlphaIndexes, word.text]);

  const answerCells = useMemo(() => {
    const input = value.trim();
    const target = word.text.trim();
    const maxLen = Math.max(input.length, target.length);
    const cells: Array<{ char: string; state: "correct" | "wrong" | "missing" | "extra" }> = [];

    for (let i = 0; i < maxLen; i += 1) {
      const inputChar = input[i];
      const targetChar = target[i];

      if (inputChar == null && targetChar != null) {
        cells.push({ char: "-", state: "missing" });
        continue;
      }

      if (inputChar != null && targetChar == null) {
        cells.push({ char: inputChar, state: "extra" });
        continue;
      }

      if ((inputChar ?? "").toLowerCase() === (targetChar ?? "").toLowerCase()) {
        cells.push({ char: inputChar ?? "", state: "correct" });
      } else {
        cells.push({ char: inputChar ?? "", state: "wrong" });
      }
    }

    return cells;
  }, [value, word.text]);

  const handleSubmitAnswer = () => {
    if (isChecked) return;
    const isCorrect = value.trim().toLowerCase() === word.text.trim().toLowerCase();
    if (isCorrect) {
      const audio = correctAudioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => undefined);
      }
    }
    if (speakOnCheck) {
      speakWord();
    }
    setIsChecked(true);
    // Prevent the same Enter press from being interpreted as "know this".
    skipNextEnterRef.current = true;
  };

  const handleRevealHint = () => {
    if (isChecked) return;
    setHintStep((prev) => Math.min(prev + 1, 3));
  };

  const speakWord = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !word.text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.lang = speechLanguage;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (speakOnRender) {
      speakWord();
    }
  }, [speakOnRender, word.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTypingElement =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target?.isContentEditable;

      if ((event.key === "s" || event.key === "S") && !isTypingElement) {
        event.preventDefault();
        speakWord();
        return;
      }

      if ((event.key === "h" || event.key === "H") && !isTypingElement && !isChecked) {
        event.preventDefault();
        handleRevealHint();
        return;
      }

      if (!isChecked) return;

      if (event.key === "Enter") {
        event.preventDefault();
        if (skipNextEnterRef.current) {
          skipNextEnterRef.current = false;
          return;
        }
        if (canKnowThis) {
          onKnowThis();
        }
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onStillLearning();
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        if (canKnowThis) {
          onKnowThis();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [canKnowThis, isChecked, onKnowThis, onStillLearning, word.id]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-1 flex-col gap-2 rounded-xl border border-slate-200 bg-[#f7f8ff] p-2.5 dark:border-slate-700 dark:bg-slate-900 sm:gap-3 sm:rounded-2xl sm:p-4 lg:gap-4 lg:rounded-3xl lg:p-5">
      {isChecked ? (
        <div className="min-h-11 rounded-lg border-2 border-[#198de6]/35 bg-white px-2 py-1 dark:bg-slate-800 sm:min-h-12 sm:rounded-xl sm:px-2.5 lg:min-h-14 lg:rounded-2xl lg:px-3">
          <div className="flex h-full flex-wrap items-center justify-center gap-1">
            {answerCells.map((cell, idx) => (
              <span
                key={`${cell.char}-${idx}`}
                className={`inline-flex min-w-5 items-center justify-center rounded px-1 py-0.5 text-sm font-semibold leading-none sm:min-w-6 sm:px-1.5 sm:text-base lg:min-w-7 lg:text-lg ${cell.state === "correct"
                  ? "bg-emerald-200 text-slate-900 dark:bg-emerald-700/50 dark:text-slate-100"
                  : cell.state === "wrong" || cell.state === "extra"
                    ? "bg-rose-200 text-slate-900 dark:bg-rose-700/50 dark:text-slate-100"
                    : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                  }`}
              >
                {cell.char}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <Input
          ref={inputRef}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onPressEnter={handleSubmitAnswer}
          placeholder={t("deck.typeWord.placeholder")}
          disabled={isChecked}
          className="!h-11 !rounded-lg !border-2 !border-[#198de6]/35 !bg-white !text-center !text-sm !font-semibold placeholder:!font-semibold placeholder:!text-slate-300 dark:!bg-slate-800 dark:!text-slate-100 dark:placeholder:!text-slate-500 sm:!h-12 sm:!rounded-xl sm:!text-base lg:!h-14 lg:!rounded-2xl lg:!text-xl"
        />
      )}

      <div className="relative flex min-h-0 flex-1 flex-col justify-between rounded-xl border border-[#198de6]/20 bg-white p-3 shadow-sm dark:bg-slate-800 sm:rounded-2xl sm:p-4 lg:rounded-3xl lg:p-6">
        <button
          type="button"
          onClick={speakWord}
          className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#198de6]/10 text-[#198de6] transition-all duration-200 hover:scale-105 hover:bg-[#198de6]/20 hover:text-[#0f6fb6] hover:shadow-sm active:scale-95 sm:right-4 sm:top-4 sm:h-9 sm:w-9 lg:right-6 lg:top-6 lg:h-10 lg:w-10"
          aria-label="Speak word"
        >
          <Volume2 className="h-4 w-4 lg:h-5 lg:w-5" />
        </button>
        {isChecked || hintStep > 0 ? (
          <p
            className={`text-center text-xs font-semibold tracking-[0.08em] sm:text-sm lg:text-base ${isChecked ? "text-emerald-600" : "text-slate-500"}`}
          >
            {isChecked ? word.text : maskedHint}
          </p>
        ) : null}
        <p className="text-center text-2xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-3xl lg:text-5xl">{word.meaning}</p>
        <p className="mt-1 text-center text-xs italic text-slate-500 sm:mt-2 sm:text-sm lg:text-lg">{word.pronunciation}</p>

        <div className="mt-3 flex items-center justify-center sm:mt-4 lg:mt-6">
          <span className="rounded-full border border-[#198de6]/30 bg-[#198de6]/10 px-3 py-1 text-[11px] font-semibold text-slate-700 sm:px-4 sm:text-xs lg:px-5 lg:py-2 lg:text-sm">
            {word.partOfSpeech}
          </span>
        </div>

        {isChecked ? (
          <div className="mt-4 flex items-start justify-center gap-2 sm:mt-5 sm:gap-2.5 lg:mt-6 lg:gap-3">
            <div className="flex flex-col items-center">
              <Button
                className="!h-10 !min-w-[112px] !rounded-lg !border-2 !border-slate-300 !bg-white !px-4 !text-sm !font-semibold !text-slate-700 dark:!border-slate-600 dark:!bg-slate-800 dark:!text-slate-100 sm:!h-11 sm:!min-w-[136px] sm:!rounded-xl sm:!px-5 sm:!text-base lg:!h-12 lg:!min-w-[160px] lg:!rounded-2xl lg:!text-lg"
                onClick={onStillLearning}
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
                  <RotateCcw className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
                  {t("deck.flashcard.stillLearning")}
                </span>
              </Button>
              <span className="mt-1 text-[10px] text-slate-400 sm:text-[11px] lg:text-xs">{t("deck.flashcard.keyLeft")}</span>
            </div>
            <div className="flex flex-col items-center">
              <Button
                type="primary"
                className="!h-10 !min-w-[112px] !rounded-lg !border-0 !bg-[#198de6] !px-4 !text-sm !font-semibold sm:!h-11 sm:!min-w-[136px] sm:!rounded-xl sm:!px-5 sm:!text-base lg:!h-12 lg:!min-w-[160px] lg:!rounded-2xl lg:!text-lg"
                onClick={onKnowThis}
                disabled={!canKnowThis}
              >
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                  {t("deck.flashcard.knowThis")}
                </span>
              </Button>
              <span className="mt-1 text-[10px] text-slate-400 sm:text-[11px] lg:text-xs">{t("deck.flashcard.keyRight")}</span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center sm:mt-5 lg:mt-6">
            <Button
              className="!h-10 !rounded-lg !border-0 !bg-[#198de6] !px-4 !text-sm !font-semibold !text-white hover:!bg-[#0f6fb6] sm:!h-11 sm:!rounded-xl sm:!px-5 sm:!text-base lg:!h-12 lg:!rounded-2xl lg:!px-6 lg:!text-lg"
              onClick={handleRevealHint}
              disabled={hintStep >= 3}
              type="primary"
            >
              <span className="inline-flex items-center gap-1.5 sm:gap-2">
                <Lightbulb className="h-4 w-4 lg:h-5 lg:w-5" />
                {t("deck.typeWord.hintButton", { step: hintStep })}
              </span>
            </Button>
          </div>
        )}
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10px] text-slate-400 sm:mt-3 sm:gap-x-6 sm:text-[11px] lg:text-xs">
          <span>
            {t("deck.flashcard.speakHint")}: <span className="font-medium text-slate-500">S</span>
          </span>
          <span>
            {t("deck.typeWord.keyHint")}: <span className="font-medium text-slate-500">H</span>
          </span>
          <span>
            {t("deck.typeWord.keyCheck")}: <span className="font-medium text-slate-500">Enter</span>
          </span>
        </div>
      </div>
    </div>
  );
}
