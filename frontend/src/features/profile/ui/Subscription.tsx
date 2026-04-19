import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BarChart3, Briefcase, Coins, HandCoins } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SubscriptionPlanTab } from "./subscription-tabs/SubscriptionPlanTab";
import { SubscriptionUsageTab } from "./subscription-tabs/SubscriptionUsageTab";
import { SUBSCRIPTION_ANCHOR } from "../subscriptionAnchors";
import { useCredits } from "@/features/credits/query";

type SubscriptionTab = "plan" | "usage";

export function Subscription() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [tab, setTab] = useState<SubscriptionTab>("plan");

  const { data: creditBalance } = useCredits();

  const credits = creditBalance?.credits ?? 0;
  const coins = creditBalance?.coins ?? 0;
  const localeNum = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("tab");
    if (q === "plan" || q === "usage") {
      setTab(q);
      return;
    }
    const raw = location.hash.replace(/^#/, "");
    if (raw !== SUBSCRIPTION_ANCHOR.topup && raw !== SUBSCRIPTION_ANCHOR.coin) return;
    setTab("plan");
    const run = () =>
      document.getElementById(raw)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    requestAnimationFrame(() => {
      setTimeout(run, 0);
    });
  }, [location.hash, location.pathname, location.search]);

  const tabs: { id: SubscriptionTab; icon: typeof Briefcase; label: string; path: string }[] = [
    { id: "plan", icon: Briefcase, label: t("profile.subscriptionPage.tabs.plan"), path: "/profile/subscription?tab=plan" },
    { id: "usage", icon: BarChart3, label: t("profile.subscriptionPage.tabs.usage"), path: "/profile/subscription?tab=usage" },
  ];

  return (
    <div className="flex-1 min-w-0 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-900 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900 pointer-events-none" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">


            <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-stretch">
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/90 sm:min-w-[180px] sm:px-5 sm:py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 sm:h-11 sm:w-11">
                  <Coins size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {t("profile.subscriptionPage.creditBalance")}
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
                    {credits.toLocaleString(localeNum)}
                    <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {t("profile.subscriptionPage.creditUnit")}
                    </span>
                  </p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm dark:border-slate-600 dark:bg-slate-800/90 sm:min-w-[180px] sm:px-5 sm:py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400 sm:h-11 sm:w-11">
                  <HandCoins size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    {t("profile.subscriptionPage.coinBalance")}
                  </p>
                  <p className="text-xl font-bold tabular-nums leading-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
                    {coins.toLocaleString(localeNum)}
                    <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                      {t("profile.subscriptionPage.coinUnit")}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Segmented tabs */}
          <div className="mt-6 border-t border-slate-200/70 pt-5 dark:border-slate-700/80">
            <div className="inline-flex w-full flex-wrap gap-1 rounded-xl bg-slate-100/90 p-1 dark:bg-slate-800/80 sm:w-auto">
              {tabs.map(({ id, icon: Icon, label, path }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setTab(id);
                      navigate(path);
                    }}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all sm:flex-initial sm:px-4 ${active
                      ? "bg-white text-primary shadow-sm dark:bg-slate-700 dark:text-sky-400"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                      }`}
                  >
                    <Icon size={17} strokeWidth={active ? 2.25 : 2} className="shrink-0 opacity-90" />
                    <span className="whitespace-nowrap">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {tab === "usage" && <SubscriptionUsageTab />}
      {tab === "plan" && <SubscriptionPlanTab coins={coins} localeNum={localeNum} />}
    </div>
  );
}
