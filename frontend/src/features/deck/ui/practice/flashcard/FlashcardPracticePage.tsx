import { Button, Modal, Progress } from "antd";
import { ArrowLeft, Cog } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { DeckPracticePageState } from "@/features/deck/schema";
import { LOCAL_STORAGE_KEYS } from "@/shared/storage/keys";
import { getLocalStorageBoolean, getLocalStorageItem, setLocalStorageBoolean, setLocalStorageItem } from "@/shared/storage/local-storage";
import { FlashcardMode } from "./FlashcardMode";
import { FlashcardSettings } from "./FlashcardSettings";
import { toPracticeWords, type PracticeWord } from "../shared/types";

export default function FlashcardPracticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DeckPracticePageState | null) ?? null;
  const words = useMemo(() => toPracticeWords(state?.vocabularies ?? []), [state?.vocabularies]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitWarningOpen, setIsExitWarningOpen] = useState(false);
  const [flashcardQueue, setFlashcardQueue] = useState<PracticeWord[]>([]);
  const [knownCount, setKnownCount] = useState(0);
  const [startFace, setStartFaceState] = useState<"front" | "back">(() => {
    const value = getLocalStorageItem(LOCAL_STORAGE_KEYS.deckPractice.flashcard.startFace);
    return value === "front" || value === "back" ? value : "front";
  });
  const [speakOnFlip, setSpeakOnFlipState] = useState<boolean>(() =>
    getLocalStorageBoolean(LOCAL_STORAGE_KEYS.deckPractice.flashcard.speakOnFlip, false),
  );

  useEffect(() => {
    setFlashcardQueue(words);
    setKnownCount(0);
  }, [words]);

  const setStartFace = (value: "front" | "back") => {
    setStartFaceState(value);
    setLocalStorageItem(LOCAL_STORAGE_KEYS.deckPractice.flashcard.startFace, value);
  };

  const setSpeakOnFlip = (value: boolean) => {
    setSpeakOnFlipState(value);
    setLocalStorageBoolean(LOCAL_STORAGE_KEYS.deckPractice.flashcard.speakOnFlip, value);
  };

  if (words.length === 0) {
    return (
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
        <p className="mb-4 text-xl font-semibold text-slate-900 dark:text-slate-100">{t("deck.practiceCommon.emptyPracticeData")}</p>
        <Button type="primary" onClick={() => navigate("/decks")}>
          {t("deck.practiceCommon.backToDecks")}
        </Button>
      </div>
    );
  }

  const handleStillLearning = () => {
    setFlashcardQueue((prev) => {
      if (prev.length <= 1) return prev;
      return [...prev.slice(1), prev[0]];
    });
  };

  const handleKnowThis = () => {
    setFlashcardQueue((prev) => {
      if (prev.length === 0) return prev;
      return prev.slice(1);
    });
    setKnownCount((prev) => Math.min(prev + 1, words.length));
  };

  const currentWord = flashcardQueue[0];
  const progressPercent = Math.round((knownCount / Math.max(words.length, 1)) * 100);
  const speakLanguage = state?.targetLanguage === "ZH" ? "zh-CN" : state?.targetLanguage === "KO" ? "ko-KR" : "en-US";

  return (
    <div className="mx-auto flex h-[calc(100vh-84px)] max-w-6xl min-h-0 flex-col gap-3 overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-slate-200 bg-[#f7f8ff] px-3 py-2.5 dark:border-slate-700 dark:bg-slate-900 sm:rounded-3xl sm:px-4 sm:py-3">
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExitWarningOpen(true)}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 hover:border-[#198de6] hover:text-[#198de6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            aria-label={t("deck.practiceCommon.backAria")}
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
            <span className="max-w-[180px] truncate text-slate-800 dark:text-slate-100 sm:max-w-[240px]">{state?.deckName ?? t("deck.practiceCommon.fallbackDeckName")}</span>
            <span>{knownCount} / {words.length}</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSettingsOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1.5 text-sm font-semibold text-slate-700 hover:border-[#198de6] hover:text-[#198de6] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Cog className="h-4 w-4" />
          </button>
        </div>
        <Progress percent={progressPercent} showInfo={false} strokeColor="#198de6" trailColor="#dbe7e2" />
      </div>

      <Modal
        open={isExitWarningOpen}
        onCancel={() => setIsExitWarningOpen(false)}
        title={<span className="text-base font-bold text-slate-800 dark:text-slate-100">{t("deck.practiceCommon.exitTitle")}</span>}
        centered
        destroyOnClose
        transitionName=""
        maskTransitionName=""
        footer={[
          <Button key="cancel" onClick={() => setIsExitWarningOpen(false)}>
            {t("deck.practiceCommon.exitCancel")}
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            onClick={() => {
              setIsExitWarningOpen(false);
              navigate(-1);
            }}
          >
            {t("deck.practiceCommon.exitConfirm")}
          </Button>,
        ]}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">{t("deck.practiceCommon.exitBody")}</p>
      </Modal>

      <Modal
        open={isSettingsOpen}
        onCancel={() => setIsSettingsOpen(false)}
        title={<span className="text-base font-bold text-slate-800 dark:text-slate-100">{t("deck.practiceCommon.settingsTitle")}</span>}
        width={460}
        footer={null}
        centered
        destroyOnClose
        transitionName=""
        maskTransitionName=""
        className="[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!bg-slate-50 [&_.ant-modal-content]:!p-4 dark:[&_.ant-modal-content]:!bg-slate-900"
      >
        <FlashcardSettings
          startFace={startFace}
          onChangeStartFace={setStartFace}
          speakOnFlip={speakOnFlip}
          onChangeSpeakOnFlip={setSpeakOnFlip}
        />
      </Modal>

      <div className="min-h-0 flex-1">
        {currentWord ? (
          <FlashcardMode
            word={currentWord}
            onStillLearning={handleStillLearning}
            onKnowThis={handleKnowThis}
            canKnowThis={flashcardQueue.length > 0}
            speechLanguage={speakLanguage}
            initialFace={startFace}
            speakOnFlip={speakOnFlip}
          />
        ) : (
          <div className="mx-auto flex h-full w-full max-w-4xl flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-700 dark:bg-slate-900">
            <p className="text-2xl font-semibold text-[#198de6]">{t("deck.flashcard.completed")}</p>
            <Button type="primary" onClick={() => navigate("/decks")}>
              {t("deck.practiceCommon.backToDecks")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
