import { Button, Modal, Progress } from "antd";
import { ArrowLeft, Cog } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import type { DeckPracticePageState } from "@/features/deck/schema";
import { LOCAL_STORAGE_KEYS } from "@/shared/storage/keys";
import { getLocalStorageBoolean, setLocalStorageBoolean } from "@/shared/storage/local-storage";
import { MatchMeaningMode } from "./MatchMeaningMode";
import { MatchMeaningSettings } from "./MatchMeaningSettings";
import { toPracticeWords } from "../shared/types";

export default function MatchMeaningPracticePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as DeckPracticePageState | null) ?? null;
  const words = useMemo(() => toPracticeWords(state?.vocabularies ?? []), [state?.vocabularies]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExitWarningOpen, setIsExitWarningOpen] = useState(false);
  const [speakOnCorrectMatch, setSpeakOnCorrectMatchState] = useState<boolean>(() =>
    getLocalStorageBoolean(LOCAL_STORAGE_KEYS.deckPractice.matchMeaning.speakOnCorrectMatch, false),
  );
  const [swapColumns, setSwapColumnsState] = useState<boolean>(() =>
    getLocalStorageBoolean(LOCAL_STORAGE_KEYS.deckPractice.matchMeaning.swapColumns, false),
  );
  const [matchedCount, setMatchedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(words.length);

  const setSpeakOnCorrectMatch = (value: boolean) => {
    setSpeakOnCorrectMatchState(value);
    setLocalStorageBoolean(LOCAL_STORAGE_KEYS.deckPractice.matchMeaning.speakOnCorrectMatch, value);
  };

  const setSwapColumns = (value: boolean) => {
    if (matchedCount > 0) return;
    setSwapColumnsState(value);
    setLocalStorageBoolean(LOCAL_STORAGE_KEYS.deckPractice.matchMeaning.swapColumns, value);
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

  const sourceTermLabel =
    state?.targetLanguage === "ZH"
      ? t("deck.matchMeaning.sourceChinese")
      : state?.targetLanguage === "KO"
        ? t("deck.matchMeaning.sourceKorean")
        : t("deck.matchMeaning.sourceEnglish");
  const targetTermLabel = t("deck.matchMeaning.targetVietnamese");
  const speakLanguage = state?.targetLanguage === "ZH" ? "zh-CN" : state?.targetLanguage === "KO" ? "ko-KR" : "en-US";
  const progressPercent = Math.round((matchedCount / Math.max(totalCount, 1)) * 100);

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
            <span>{matchedCount} / {totalCount}</span>
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
        closable={false}
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
        <MatchMeaningSettings
          speakOnCorrectMatch={speakOnCorrectMatch}
          onChangeSpeakOnCorrectMatch={setSpeakOnCorrectMatch}
          swapColumns={swapColumns}
          onChangeSwapColumns={setSwapColumns}
          disableSwapColumns={matchedCount > 0}
        />
      </Modal>

      <div className="min-h-0 flex-1">
        <MatchMeaningMode
          words={words}
          sourceLabel={sourceTermLabel}
          targetLabel={targetTermLabel}
          speakOnCorrectMatch={speakOnCorrectMatch}
          speakLanguage={speakLanguage}
          swapColumns={swapColumns}
          onMatchedCountChange={(count, total) => {
            setMatchedCount(count);
            setTotalCount(total);
          }}
        />
      </div>
    </div>
  );
}
