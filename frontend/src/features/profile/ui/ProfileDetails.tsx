import { useState, useEffect, useMemo } from "react";
import {
  Flame,
  FileText,
  Save,
  Clock,
  Coins,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Zap,
} from "lucide-react";
import { Button, Input, Select, message } from "antd";
import SetPasswordDialog from "../dialogs/SetPasswordDialog";
import { useUpdateMe } from "../hook/useUpdateMe";
import { useProfileStore } from "../../../stores/profile";
import {
  PROFILE_EMBED_PRACTICESTATS,
  useProfileData,
  useApiKeys,
} from "../query";
import {
  maskApiKey,
  getProviderFromModel,
} from "../../../entities/apiKey/schema";
import type { ApiKey } from "../../../entities/apiKey/schema";
import { useCreateApiKey } from "../hook/useCreateApiKey";
import { useDeleteApiKey } from "../hook/useDeleteApiKeys";
import AddApiKeyDialog from "../dialogs/AddApiKeyDialog";
import DeleteApiKeyDialog from "../dialogs/DeleteApiKeyDialog";
import SetDefaultApiKeyDialog from "../dialogs/SetDefaultApiKeyDialog";
import { formatCreatedAt } from "../../../shared/utilities";
import { showApiError } from "../../../shared/api/showApiError";
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
  const { profile: profileStore } = useProfileStore();
  const { data: creditBalance } = useCredits();
  const { mutateAsync: updateMeMutation, isPending: savingFullName } =
    useUpdateMe();
  const { theme, setTheme } = useTheme();

  const { data: apiKeys = [] } = useApiKeys();
  const { mutateAsync: createApiKeyMutation, isPending: addKeyLoading } =
    useCreateApiKey();
  const { mutateAsync: deleteApiKeyMutation } = useDeleteApiKey();

  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(
    {},
  );
  const [addKeyOpen, setAddKeyOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    maskedKey: string;
  } | null>(null);
  const [setDefaultTarget, setSetDefaultTarget] = useState<{
    id: number;
    label: string;
  } | null>(null);

  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [fullName, setFullName] = useState(profile?.fullName ?? "");

  const apiKeyGroups = useMemo(() => {
    const list = apiKeys;
    const map = new Map<string, ApiKey[]>();
    for (const item of list) {
      const k = item.apiKey;
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(item);
    }
    return Array.from(map.entries()).map(([apiKeyValue, keys]) => ({
      apiKeyValue,
      keys,
    }));
  }, [apiKeys, profileStore?.activeApiKeyId]);

  const totalTranslated = useMemo(
    () => profile?.embedded?.totalUserSentenceAnswers ?? 0,
    [profile?.embedded?.totalUserSentenceAnswers],
  );

  useEffect(() => {
    setFullName(profile?.fullName ?? "");
  }, [profile?.fullName]);

  const toggleGroup = (groupKey: number) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const handleDeleteConfirm = (id: number): Promise<void> => {
    return deleteApiKeyMutation(id)
      .then(() => {
        message.success(t("apiKeys.deleted"));
      })
      .catch(() => {
        message.error(t("apiKeys.deleteFailed"));
        throw new Error("Delete failed");
      });
  };

  const handleAddKeySubmit = async (apiKey: string) => {
    try {
      await createApiKeyMutation(apiKey);
      message.success(t("apiKeys.added"));
    } catch (err) {
      showApiError(err, t("apiKeys.addFailed"));
      throw new Error("Add failed");
    }
  };

  const handleSetDefaultConfirm = (): Promise<void> => {
    if (!setDefaultTarget || !profileStore) return Promise.resolve();
    const { id } = setDefaultTarget;
    const fullNameForUpdate =
      profileStore.fullName?.trim() || profileStore.username || "";
    return updateMeMutation({ fullName: fullNameForUpdate, activeApiKeyId: id })
      .then(() => {
        message.success(t("apiKeys.defaultSet"));
      })
      .catch(() => {
        message.error(t("apiKeys.defaultFailed"));
        throw new Error("Set default failed");
      });
  };

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {t("apiKeys.title")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("apiKeys.subtitle")}
            </p>
          </div>
          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="font-bold bg-primary shadow-sm rounded-lg h-9 w-full sm:w-auto"
            onClick={() => setAddKeyOpen(true)}
          >
            {t("apiKeys.addNew")}
          </Button>
        </div>

        <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          {apiKeyGroups.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-900/90">
              {t("apiKeys.empty")}
            </div>
          ) : (
            apiKeyGroups.map(({ apiKeyValue, keys }) => {
              const groupKey = keys[0].id;
              const isExpanded = expandedGroups[groupKey] !== false;
              const createdAt = keys[0].createdAt;
              const isGroupActive = keys.some(
                (k) => k.id === profileStore?.activeApiKeyId,
              );
              const providerName = getProviderFromModel(keys[0].model);
              return (
                <div
                  key={groupKey}
                  className="border-b border-slate-100 dark:border-slate-800 last:border-b-0 bg-white dark:bg-slate-900/90"
                >
                  <div className="flex flex-wrap items-center gap-4 px-4 py-3.5 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <button
                      type="button"
                      onClick={() => toggleGroup(groupKey)}
                      className="flex items-center gap-3 min-w-0 flex-1 text-left"
                    >
                      <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-600 shrink-0">
                        <Zap size={18} strokeWidth={2} />
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        {providerName}
                      </span>
                      <span className="font-mono text-sm text-slate-500 dark:text-slate-400">
                        {maskApiKey(apiKeyValue)}
                      </span>
                      <span className="text-slate-400 text-sm hidden sm:inline">
                        {formatCreatedAt(createdAt)}
                      </span>
                    </button>
                    {isGroupActive && (
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 border border-emerald-200/80">
                        {t("apiKeys.active")}
                      </span>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupKey)}
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-200/80 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                        title={
                          isExpanded
                            ? t("apiKeys.collapse")
                            : t("apiKeys.expand")
                        }
                      >
                        {isExpanded ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            id: keys[0].id,
                            maskedKey: maskApiKey(apiKeyValue),
                          })
                        }
                        className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 transition-colors"
                        title={t("apiKeys.deleteKey")}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-slate-50/60 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800">
                      <div className="px-4 pt-3 pb-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          {t("apiKeys.models")}
                        </p>
                      </div>
                      <div className="px-4 pb-3">
                        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/90 overflow-hidden">
                          {keys.map((key) => {
                            const hasCredit = key.credit > 0;
                            const isDefault =
                              profileStore?.activeApiKeyId === key.id;
                            return (
                              <div
                                key={key.id}
                                className="flex flex-wrap items-center gap-4 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-b-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50"
                              >
                                <span className="font-medium text-slate-800 dark:text-slate-100 min-w-[140px] text-sm">
                                  {key.model}
                                </span>

                                {hasCredit ? (
                                  <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200/80">
                                    {t("apiKeys.credit", { count: key.credit })}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 border border-red-200/80">
                                    {t("apiKeys.outOfCredit")}
                                  </span>
                                )}
                                <div className="ml-auto">
                                  {isDefault ? (
                                    <span className="text-primary font-medium text-sm text-blue-500">
                                      {t("apiKeys.inUse")}
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setSetDefaultTarget({
                                          id: key.id,
                                          label: `${key.model} (${maskApiKey(apiKeyValue)})`,
                                        })
                                      }
                                      disabled={!hasCredit}
                                      className="text-primary font-medium hover:underline text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                                    >
                                      {t("apiKeys.setDefault")}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <AddApiKeyDialog
          open={addKeyOpen}
          onClose={() => setAddKeyOpen(false)}
          onSubmit={handleAddKeySubmit}
          loading={addKeyLoading}
        />

        <DeleteApiKeyDialog
          open={!!deleteTarget}
          maskedKey={deleteTarget?.maskedKey ?? null}
          onClose={() => setDeleteTarget(null)}
          onConfirm={() =>
            deleteTarget ? handleDeleteConfirm(deleteTarget.id) : undefined
          }
        />

        <SetDefaultApiKeyDialog
          open={!!setDefaultTarget}
          label={setDefaultTarget?.label ?? null}
          onClose={() => setSetDefaultTarget(null)}
          onConfirm={handleSetDefaultConfirm}
        />
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
