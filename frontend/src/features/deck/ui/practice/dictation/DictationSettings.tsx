import { Switch } from "antd";
import { useTranslation } from "react-i18next";

type DictationSettingsProps = {
  autoPlay: boolean;
  onChangeAutoPlay: (enabled: boolean) => void;
};

export function DictationSettings({ autoPlay, onChangeAutoPlay }: DictationSettingsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t("deck.settings.dictationTitle")}</p>
      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
        <span>{t("deck.settings.dictationAutoplay")}</span>
        <Switch checked={autoPlay} onChange={onChangeAutoPlay} />
      </div>
    </div>
  );
}
