import { useState, useEffect, useMemo } from "react";
import { Flame, FileText, Save, Clock, Coins } from "lucide-react";
import { Button, Input, Select, message } from "antd";
import SetPasswordDialog from "../dialogs/SetPasswordDialog";
import { useUpdateMe } from "../hook/useUpdateMe";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "../query";
import { formatTotalHours } from "@/utils/utils";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "@/i18n";
import { useCredits } from "@/features/credits/query";
import { useTheme, type ThemeMode } from "@/app/providers/ThemeProvider";

export function ProfileDetailsSection() {
  const { t, i18n } = useTranslation();
  const uiLang: AppLanguage = i18n.language.startsWith("en") ? "en" : "vi";

  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { data: creditBalance } = useCredits();
  const { mutateAsync: updateMeMutation, isPending: savingFullName } =
    useUpdateMe();
  const { theme, setTheme } = useTheme();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");

  const totalTranslated = useMemo(
    () => profile?.embedded?.totalUserSentenceAnswers ?? 0,
    [profile?.embedded?.totalUserSentenceAnswers],
  );

  useEffect(() => {
    setFullName(profile?.fullName ?? "");
  }, [profile?.fullName]);

  const handleSaveFullName = () => {
    updateMeMutation({ fullName: fullName.trim() }).catch(() =>
      message.error(t("profile.saveFailed")),
    );
  };

  return (
    <div className="flex-1 min-w-0 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center shrink-0">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("profile.creditsRemaining")}
            </p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {creditBalance?.credits ?? 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-yellow-50 dark:bg-yellow-950/50 text-yellow-500 flex items-center justify-center shrink-0">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("profile.coinsRemaining")}
            </p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {creditBalance?.coins ?? 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-500 flex items-center justify-center shrink-0">
            <Flame size={24} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("profile.currentStreak")}
            </p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {t("profile.streakDays", { count: profile?.currentStreak ?? 0 })}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-primary flex items-center justify-center shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("profile.translated")}
            </p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {totalTranslated.toLocaleString(
                uiLang === "vi" ? "vi-VN" : "en-US",
              )}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-50 dark:bg-violet-950/50 text-violet-500 flex items-center justify-center shrink-0">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t("profile.totalPracticeTime")}
            </p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {formatTotalHours(profile?.embedded?.totalLearningTime ?? 0)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {t("profile.personalInfo")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("profile.personalInfoDesc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("profile.username")}
            </label>
            <Input
              size="large"
              defaultValue={profile?.username}
              disabled
              value={profile?.username}
              className="font-medium rounded-lg"
            />
          </div>
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t("profile.fullName")}
              </label>
              <Input
                size="large"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="font-medium rounded-lg"
              />
            </div>
            <Button
              type="primary"
              loading={savingFullName}
              onClick={handleSaveFullName}
              disabled={
                savingFullName || fullName.trim() === profile?.fullName
              }
              icon={<Save size={16} />}
              iconPosition="end"
              className="font-medium rounded-lg h-10 w-full sm:w-auto"
            >
              {t("profile.save")}
            </Button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("profile.mode")}
            </label>
            <Select
              size="large"
              value={theme}
              onChange={(v) => setTheme(v as ThemeMode)}
              className="w-full font-medium"
              options={[
                { value: "dark", label: t("profile.themeDark") },
                { value: "light", label: t("profile.themeLight") },
              ]}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              {t("profile.uiLanguage")}
            </label>
            <Select
              size="large"
              value={uiLang}
              onChange={(lng) => void i18n.changeLanguage(lng)}
              className="w-full font-medium"
              options={[
                { value: "vi", label: t("profile.langVietnamese") },
                { value: "en", label: t("profile.langEnglish") },
              ]}
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
            {t("profile.security")}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t("profile.securityDesc")}
          </p>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {t("profile.password")}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {profile?.noPassword
                  ? t("profile.noPasswordHint")
                  : t("profile.changePasswordHint")}
              </p>
            </div>
            <Button
              type={profile?.noPassword ? "primary" : "default"}
              className="font-medium rounded-lg w-full sm:w-auto"
              onClick={() => setPasswordDialogOpen(true)}
            >
              {profile?.noPassword
                ? t("profile.createPassword")
                : t("profile.changePassword")}
            </Button>
          </div>
          <div className="h-px bg-slate-100 dark:bg-slate-700"></div>
        </div>
      </div>

      <SetPasswordDialog
        open={passwordDialogOpen}
        onClose={() => setPasswordDialogOpen(false)}
        noPassword={profile?.noPassword ?? true}
      />
    </div>
  );
}
