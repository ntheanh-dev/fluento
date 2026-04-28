import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button, Input, Select, message } from "antd";
import SetPasswordDialog from "../dialogs/SetPasswordDialog";
import { useUpdateMe } from "../hook/useUpdateMe";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "../query";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "@/i18n";
import { useTheme, type ThemeMode } from "@/app/providers/ThemeProvider";
import { FlagIcon } from "@/shared/utilities/flag";

export function ProfileDetailsSection() {
  const { t, i18n } = useTranslation();
  const uiLang: AppLanguage = i18n.language.startsWith("en") ? "en" : "vi";

  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { mutateAsync: updateMeMutation, isPending: savingFullName } =
    useUpdateMe();
  const { theme, setTheme } = useTheme();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");

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
                {
                  value: "vi",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <FlagIcon countryCode="VN" className="h-3.5 w-5 rounded-[2px]" />
                      <span>Vietnamese</span>
                    </span>
                  ),
                },
                {
                  value: "en",
                  label: (
                    <span className="inline-flex items-center gap-2">
                      <FlagIcon countryCode="US" className="h-3.5 w-5 rounded-[2px]" />
                      <span>English</span>
                    </span>
                  ),
                },
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
