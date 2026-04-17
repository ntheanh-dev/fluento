import { useState, useEffect, useRef, useMemo } from "react";
import {
  User,
  LogOut,
  Flame,
  FileText,
  Save,
  Camera,
  Clock,
  Coins,
} from "lucide-react";
import { Avatar, Button, Input, Select, message } from "antd";
import SetPasswordDialog from "../dialogs/SetPasswordDialog";
import { useUpdateMe } from "../hook/useUpdateMe";
import {
  ACCEPT_IMAGE,
  AVATAR_MAX_BYTES,
  ALLOWED_IMAGE_TYPES,
} from "../../../shared/validation/constant";
import ApiKeysSection from "./ApiKeysSection";
import { formatTotalHours } from "@/utils/utils";
import { useTranslation } from "react-i18next";
import type { AppLanguage } from "@/i18n";
import { useLogoutMutation } from "@/features/auth/mutation";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "../query";
import { useCredits } from "@/features/credits/query";
import { useTheme, type ThemeMode } from "@/app/providers/ThemeProvider";
import { getLevelLabel } from "@/i18n/labels";

const Profile = () => {
  const { t, i18n } = useTranslation();
  const uiLang: AppLanguage = i18n.language.startsWith("en") ? "en" : "vi";

  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { data: creditBalance } = useCredits();
  const { mutateAsync: updateMeMutation, isPending: savingFullName } =
    useUpdateMe();
  const navigate = useNavigate();
  const { mutateAsync: logout } = useLogoutMutation();
  const { theme, setTheme } = useTheme();

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

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

  const handleAvatarClick = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";

    if (!file) return;

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
      )
    ) {
      message.warning(t("profile.avatarInvalidType"));
      return;
    }

    if (file.size > AVATAR_MAX_BYTES) {
      message.warning(
        t("profile.avatarTooLarge", {
          maxMb: AVATAR_MAX_BYTES / 1024 / 1024,
        }),
      );
      return;
    }

    setUploadingAvatar(true);
    updateMeMutation({}, file)
      .then(() => message.success(t("profile.avatarUpdated")))
      .catch(() => message.error(t("profile.avatarUpdateFailed")))
      .finally(() => setUploadingAvatar(false));
  };

  const handleLogout = async () => {
    await logout(Cookies.get("accessToken") || "");
    navigate("/home");
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:px-6 lg:px-8 pb-8 dark:text-slate-100">
      {/* Main Layout Container */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Profile Summary Card */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
            <div className="relative mb-4">
              <input
                ref={avatarInputRef}
                type="file"
                accept={ACCEPT_IMAGE}
                className="hidden"
                aria-hidden
                onChange={handleAvatarChange}
              />
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="relative w-24 h-24 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 text-3xl font-bold border-4 border-white shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {profile?.urlAvatar ? (
                  <>
                    <img
                      src={profile?.urlAvatar}
                      alt={profile?.fullName}
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <Avatar size={96} icon={<User size={48} />} />
                )}
                <span className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white" />
                </span>
                {uploadingAvatar && (
                  <span className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </span>
                )}
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {profile?.fullName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {getLevelLabel(profile?.embedded?.totalUserSentenceAnswers ?? 0, t)}
            </p>
          </div>

          {/* Navigation Menu */}
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/50 text-primary rounded-xl font-medium text-sm transition-colors">
                <User size={18} /> {t("profile.profileDetails")}
              </button>
              {/* <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-colors">
                <History size={18} /> Lịch sử dịch
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl font-medium text-sm transition-colors">
                <CreditCard size={18} /> Gói đăng ký
              </button> */}
              <div className="h-px bg-slate-100 dark:bg-slate-700 my-1 mx-2"></div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium text-sm transition-colors"
              >
                <LogOut size={18} /> {t("profile.logout")}
              </button>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Stats Row */}
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

          {/* Personal Information */}
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

          <ApiKeysSection />

          {/* Security */}
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
      </div>
    </div>
  );
};

export default Profile;
