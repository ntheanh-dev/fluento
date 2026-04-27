import { Switch } from "antd";
import { useTranslation } from "react-i18next";

type FlashcardSettingsProps = {
  startFace: "front" | "back";
  onChangeStartFace: (face: "front" | "back") => void;
  speakOnFlip: boolean;
  onChangeSpeakOnFlip: (enabled: boolean) => void;
};

export function FlashcardSettings({
  startFace,
  onChangeStartFace,
  speakOnFlip,
  onChangeSpeakOnFlip,
}: FlashcardSettingsProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-3 py-1">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{t("deck.settings.startFront")}:</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {startFace === "front" ? t("deck.settings.startFrontValueFront") : t("deck.settings.startFrontValueBack")}
          </p>
        </div>
        <Switch checked={startFace === "back"} onChange={(checked) => onChangeStartFace(checked ? "back" : "front")} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[15px] font-medium text-slate-900 dark:text-slate-100">{t("deck.settings.speakOnFlip")}:</p>
        </div>
        <Switch checked={speakOnFlip} onChange={onChangeSpeakOnFlip} />
      </div>
    </div>
  );
}
