import { Modal } from "antd";
import { Dices, Ear, Keyboard, Puzzle, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { DeckPracticeMode, VocabularyItem } from "@/features/deck/schema";

type PracticeConfirmModalProps = {
  open: boolean;
  totalWords: number;
  vocabularies: VocabularyItem[];
  useFilteredFallback: boolean;
  onCancel: () => void;
  onSelectMode: (mode: DeckPracticeMode, vocabularies: VocabularyItem[]) => void;
};

const PRACTICE_OPTIONS: Array<{
  mode: DeckPracticeMode | "RANDOM";
  titleKey: string;
  descriptionKey: string;
  icon: typeof Puzzle;
}> = [
    {
      mode: "FLASHCARD",
      titleKey: "deck.practiceMode.flashcardTitle",
      descriptionKey: "deck.practiceMode.flashcardDesc",
      icon: Sparkles,
    },
    {
      mode: "MATCH_MEANING",
      titleKey: "deck.practiceMode.matchMeaningTitle",
      descriptionKey: "deck.practiceMode.matchMeaningDesc",
      icon: Puzzle,
    },
    {
      mode: "TYPE_WORD",
      titleKey: "deck.practiceMode.typeWordTitle",
      descriptionKey: "deck.practiceMode.typeWordDesc",
      icon: Keyboard,
    },
    {
      mode: "RANDOM",
      titleKey: "deck.practiceMode.randomTitle",
      descriptionKey: "deck.practiceMode.randomDesc",
      icon: Dices,
    },
  ];

export function PracticeConfirmModal({
  open,
  totalWords,
  vocabularies,
  useFilteredFallback,
  onCancel,
  onSelectMode,
}: PracticeConfirmModalProps) {
  const { t } = useTranslation();
  const pickRandomMode = (): DeckPracticeMode => {
    const candidates: DeckPracticeMode[] = ["FLASHCARD", "MATCH_MEANING", "TYPE_WORD"];
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  };

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={700}
      destroyOnClose
      transitionName=""
      maskTransitionName=""
      className="[&_.ant-modal]:!max-w-[calc(100vw-32px)]"
    >
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-center text-xl font-semibold text-slate-900 dark:text-slate-100 sm:text-2xl">
            {t("deck.practiceModeTitle")}
          </p>
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {useFilteredFallback
              ? t("deck.practiceWithList", { count: totalWords })
              : t("deck.practiceWithSelection", { count: totalWords })}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PRACTICE_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.mode}
                type="button"
                className="group rounded-xl border border-slate-200 bg-white p-4 text-left transition-all duration-200 hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/70 dark:hover:bg-slate-800"
                onClick={() => onSelectMode(option.mode === "RANDOM" ? pickRandomMode() : option.mode, vocabularies)}
              >
                <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8f4fd] text-[#198de6] transition-colors group-hover:bg-[#d8ecfa] dark:bg-slate-700 dark:text-sky-300">
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mb-1.5 text-xl font-semibold text-slate-900 dark:text-slate-100">{t(option.titleKey)}</p>
                <p className="text-sm leading-5 text-slate-500 dark:text-slate-400">{t(option.descriptionKey)}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center border-t border-slate-200 pt-3 dark:border-slate-700">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#198de6] dark:text-sky-300">
            <Ear className="h-4 w-4" />
            <span>{t("deck.memoryBoost")}</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
