import { Switch } from "antd";
import { useTranslation } from "react-i18next";

type TypeWordSettingsProps = {
  speakOnRender: boolean;
  speakOnCheck: boolean;
  onChangeSpeakOnRender: (enabled: boolean) => void;
  onChangeSpeakOnCheck: (enabled: boolean) => void;
};

export function TypeWordSettings({
  speakOnRender,
  speakOnCheck,
  onChangeSpeakOnRender,
  onChangeSpeakOnCheck,
}: TypeWordSettingsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{t("deck.settings.speakOnRender")}:</p>
        </div>
        <Switch checked={speakOnRender} onChange={onChangeSpeakOnRender} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{t("deck.settings.speakOnCheck")}:</p>
        </div>
        <Switch checked={speakOnCheck} onChange={onChangeSpeakOnCheck} />
      </div>
    </div>
  );
}
