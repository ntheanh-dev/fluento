import { Button } from "antd";
import { BookOpenText, CheckCircle2, RotateCcw, Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PracticeWord } from "../shared/types";

type FlashcardModeProps = {
  word: PracticeWord;
  canKnowThis: boolean;
  onStillLearning: () => void;
  onKnowThis: () => void;
  initialFace?: "front" | "back";
  speakOnFlip?: boolean;
};

export function FlashcardMode({
  word,
  canKnowThis,
  onStillLearning,
  onKnowThis,
  initialFace = "front",
  speakOnFlip = false,
}: FlashcardModeProps) {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);

  const speakText = useCallback((text: string, lang: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window) || !text.trim()) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, []);

  useEffect(() => {
    setIsFlipped(initialFace === "back");
  }, [word.id, initialFace]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSpeakCurrent = useCallback(() => {
    // Keep behavior aligned with setting: only speak front side.
    if (!isFlipped) {
      speakText(word.text, "en-US");
    }
  }, [isFlipped, speakText, word.text]);

  const handleFlipCard = useCallback(() => {
    const nextIsFlipped = !isFlipped;
    setIsFlipped(nextIsFlipped);
    if (speakOnFlip) {
      if (!nextIsFlipped) {
        speakText(word.text, "en-US");
      }
    }
  }, [isFlipped, speakOnFlip, speakText, word.text]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key;

      if (key === "s" || key === "S") {
        event.preventDefault();
        handleSpeakCurrent();
        return;
      }

      if (key === " " || key === "Enter") {
        event.preventDefault();
        handleFlipCard();
        return;
      }

      if (key === "ArrowLeft") {
        event.preventDefault();
        onStillLearning();
        return;
      }

      if (key === "ArrowRight") {
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
  }, [canKnowThis, handleFlipCard, handleSpeakCurrent, onKnowThis, onStillLearning]);

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl min-h-0 flex-1 flex-col gap-2 rounded-2xl border border-slate-200 bg-[#f7f8ff] p-3 dark:border-slate-700 dark:bg-slate-900 sm:gap-3 sm:rounded-3xl sm:p-5">
      <button
        type="button"
        onClick={handleFlipCard}
        className="relative flex min-h-0 flex-1 [perspective:1200px]"
      >
        <div
          className={`relative h-full w-full rounded-2xl transition-transform duration-500 [transform-style:preserve-3d] sm:rounded-3xl ${isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
        >
          <div className="absolute inset-0 flex flex-col justify-between rounded-2xl border border-[#198de6]/20 bg-white p-3 shadow-sm [backface-visibility:hidden] dark:bg-slate-800 sm:rounded-3xl sm:p-6">
            <div className="mb-2 flex justify-end sm:mb-4">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSpeakCurrent();
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#198de6]/10 text-[#198de6] transition-all duration-200 hover:scale-105 hover:bg-[#198de6]/20 hover:text-[#0f6fb6] hover:shadow-sm active:scale-95 sm:h-12 sm:w-12"
              >
                <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#198de6]/10 text-[#198de6] sm:mb-5 sm:h-14 sm:w-14">
              <BookOpenText className="h-5 w-5 sm:h-8 sm:w-8" />
            </div>
            <h3 className="line-clamp-3 text-center text-3xl font-bold text-slate-900 dark:text-slate-100 sm:line-clamp-2 sm:text-5xl">{word.text}</h3>
            <p className="mt-1 text-center text-sm font-medium italic text-slate-500 sm:text-xl">{word.pronunciation}</p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3">
              <span className="rounded-full border border-[#198de6]/30 bg-[#198de6]/10 px-3 py-1 text-xs font-semibold text-slate-700 sm:px-5 sm:py-2 sm:text-base">
                {word.partOfSpeech}
              </span>
            </div>
            <p className="mt-2 text-center text-xs text-slate-400 sm:mt-3 sm:text-sm">{t("deck.flashcard.clickToFlip")}</p>
          </div>

          <div className="absolute inset-0 flex flex-col justify-center rounded-2xl border border-[#198de6]/20 bg-white p-4 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] dark:bg-slate-800 sm:rounded-3xl sm:p-6">
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-[#198de6] sm:mb-3 sm:text-sm sm:tracking-[0.18em]">
              {t("deck.flashcard.meaningLabel")}
            </p>
            <p className="text-center text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-4xl">{word.meaning}</p>
            <p className="mt-3 text-center text-xs text-slate-400 sm:mt-5 sm:text-sm">{t("deck.flashcard.clickToFlipBack")}</p>
          </div>
        </div>
      </button>

      <div className="flex items-start justify-center gap-2 sm:gap-3">
        <div className="flex flex-col items-center">
          <Button
            size="large"
            className="!h-11 !rounded-xl !border-2 !border-slate-400 !bg-white !px-4 !text-base !font-semibold !text-slate-800 dark:!border-slate-600 dark:!bg-slate-800 dark:!text-slate-100 sm:!h-14 sm:!rounded-2xl sm:!px-5 sm:!text-2xl"
            onClick={onStillLearning}
          >
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
              <RotateCcw className="h-4 w-4 text-red-500 sm:h-5 sm:w-5" />
              {t("deck.flashcard.stillLearning")}
            </span>
          </Button>
          <span className="mt-1 text-[11px] text-slate-400 sm:text-xs">{t("deck.flashcard.keyLeft")}</span>
        </div>

        <div className="flex flex-col items-center">
          <Button
            type="primary"
            size="large"
            className="!h-11 !rounded-xl !border-0 !bg-[#198de6] !px-4 !text-base !font-semibold sm:!h-14 sm:!rounded-2xl sm:!px-5 sm:!text-2xl"
            onClick={onKnowThis}
            disabled={!canKnowThis}
          >
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap sm:gap-2">
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("deck.flashcard.knowThis")}
            </span>
          </Button>
          <span className="mt-1 text-[11px] text-slate-400 sm:text-xs">{t("deck.flashcard.keyRight")}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400 sm:gap-6 sm:text-xs">
        <span>
          {t("deck.flashcard.speakHint")}: <span className="font-medium text-slate-500">S</span>
        </span>
        <span>
          {t("deck.flashcard.flipHint")}: <span className="font-medium text-slate-500">Space / Enter</span>
        </span>
      </div>
    </div>
  );
}
