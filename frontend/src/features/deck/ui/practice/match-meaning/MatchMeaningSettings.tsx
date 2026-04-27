import { Switch } from "antd";
import { useTranslation } from "react-i18next";

type MatchMeaningSettingsProps = {
  speakOnCorrectMatch: boolean;
  onChangeSpeakOnCorrectMatch: (enabled: boolean) => void;
  swapColumns: boolean;
  onChangeSwapColumns: (enabled: boolean) => void;
  disableSwapColumns?: boolean;
};

export function MatchMeaningSettings({
  speakOnCorrectMatch,
  onChangeSpeakOnCorrectMatch,
  swapColumns,
  onChangeSwapColumns,
  disableSwapColumns = false,
}: MatchMeaningSettingsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{t("deck.settings.speakOnCorrectMatch")}:</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("deck.settings.speakOnCorrectMatchHint")}</p>
        </div>
        <Switch checked={speakOnCorrectMatch} onChange={onChangeSpeakOnCorrectMatch} />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{t("deck.settings.swapColumns")}:</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {disableSwapColumns
              ? t("deck.settings.swapColumnsHintDisabled")
              : t("deck.settings.swapColumnsHintEnabled")}
          </p>
        </div>
        <Switch checked={swapColumns} onChange={onChangeSwapColumns} disabled={disableSwapColumns} />
      </div>
    </div>
  );
}
