import { Button, Input, Tag } from "antd";
import { Volume2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { PracticeWord } from "../shared/types";

type DictationModeProps = {
  word: PracticeWord;
  canGoNext: boolean;
  onNext: () => void;
};

export function DictationMode({ word, canGoNext, onNext }: DictationModeProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");

  return (
    <div className="mx-auto max-w-5xl">
      <div className="rounded-[32px] bg-white p-8 shadow-sm dark:bg-slate-900">
        <p className="mb-6 text-center text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-5xl">{t("deck.practiceMode.typeWordTitle")}</p>
        <div className="mb-5 flex items-center justify-center gap-4">
          <Volume2 className="h-5 w-5 cursor-pointer text-cyan-500 transition-all duration-200 hover:scale-105 hover:text-cyan-600" />
          <Tag className="!rounded-full !px-4 !py-1">{word.partOfSpeech}</Tag>
        </div>
        <p className="mb-8 text-center text-slate-400 dark:text-slate-500">{t("deck.typeWord.hintButton", { step: 0 })}</p>
        <Input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={t("deck.typeWord.placeholder")}
          className="!h-14 !rounded-full !text-xl"
        />
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button className="!h-12 !rounded-full !px-6">{t("practice.feedback.suggestionTitle")}</Button>
          <Button className="!h-12 !rounded-full !px-6">{t("deck.typeWord.hintButton", { step: 3 })}</Button>
          <Button
            type="primary"
            className="!h-12 !rounded-full !bg-lime-500 !px-8 !text-lg !font-semibold"
            onClick={() => {
              onNext();
              setValue("");
            }}
            disabled={!canGoNext}
          >
            {t("practice.session.check")}
          </Button>
        </div>
      </div>
    </div>
  );
}
