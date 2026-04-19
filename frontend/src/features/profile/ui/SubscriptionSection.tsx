import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  BarChart3,
  Briefcase,
  Coins,
  Crown,
  HandCoins,
  Headphones,
  History,
  RotateCcw,
  Shield,
  Sparkles,
  User,
  Wallet,
  Zap,
} from "lucide-react";
import { Avatar, Button, Tooltip, message } from "antd";
import { useTranslation } from "react-i18next";
import {
  COIN_EXCHANGE_PACKS,
  FREE_CREDITS_PER_DAY,
  PRO_CREDITS_PER_DAY,
  PRO_PRICE_VND,
  TOPUP_PACKS,
} from "../constant";
import { PROFILE_EMBED_PRACTICESTATS, useProfileData } from "../query";
import { SUBSCRIPTION_ANCHOR } from "../subscriptionAnchors";
import { useCredits } from "@/features/credits/query";
import { useExchangeCoins } from "@/features/credits/useExchangeCoins";
import { showApiError } from "@/shared/api/showApiError";

type SubscriptionTab = "plan" | "usage" | "payment";

function formatMemberSince(iso: string | undefined, locale: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(locale.startsWith("vi") ? "vi-VN" : "en-US", {
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

export function SubscriptionSection() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [tab, setTab] = useState<SubscriptionTab>("plan");

  const { data: profile } = useProfileData({
    queryParams: PROFILE_EMBED_PRACTICESTATS,
  });
  const { data: creditBalance } = useCredits();
  const { mutate: runCoinExchange, isPending: isExchanging, variables: exchangingCoins } =
    useExchangeCoins();

  const displayName = profile?.fullName?.trim() || profile?.username || "—";
  const memberSince = useMemo(
    () => formatMemberSince(profile?.createdAt, i18n.language),
    [profile?.createdAt, i18n.language],
  );

  const credits = creditBalance?.credits ?? 0;
  const coins = creditBalance?.coins ?? 0;
  const localeNum = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";

  useEffect(() => {
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
  }, [location.hash, location.pathname]);

  const tabs: { id: SubscriptionTab; icon: typeof Briefcase; label: string }[] =
    [
      { id: "plan", icon: Briefcase, label: t("profile.subscriptionPage.tabs.plan") },
      { id: "usage", icon: BarChart3, label: t("profile.subscriptionPage.tabs.usage") },
      {
        id: "payment",
        icon: History,
        label: t("profile.subscriptionPage.tabs.payment"),
      },
    ];

  return (
    <div className="flex-1 min-w-0 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-700/90 bg-white dark:bg-slate-900 shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50/90 via-white to-indigo-50/40 dark:from-slate-800/80 dark:via-slate-900 dark:to-slate-900 pointer-events-none" />
        <div className="relative p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {profile?.urlAvatar ? (
                <img
                  src={profile.urlAvatar}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-2xl border-2 border-white object-cover shadow-md dark:border-slate-600 sm:h-[72px] sm:w-[72px]"
                />
              ) : (
                <Avatar
                  size={72}
                  className="shrink-0 !flex !items-center !justify-center"
                  icon={<User size={34} />}
                />
              )}
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-2xl">
                  {t("profile.subscriptionPage.greeting", { name: displayName })}
                </h2>
                <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {t("profile.subscriptionPage.memberSince", { date: memberSince })}
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                  {t("profile.subscriptionPage.planBadgeFree")}
                </span>
              </div>
            </div>

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
              {tabs.map(({ id, icon: Icon, label }) => {
                const active = tab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setTab(id)}
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

      {tab === "usage" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
            <BarChart3 className="text-slate-400" size={28} />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("profile.subscriptionPage.usagePlaceholder")}
          </p>
          <span className="mt-4 text-xs font-medium text-slate-400">
            {t("profile.subscriptionPage.emptyStateHint")}
          </span>
        </div>
      )}

      {tab === "payment" && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-800">
            <Wallet className="text-slate-400" size={28} />
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {t("profile.subscriptionPage.paymentPlaceholder")}
          </p>
          <span className="mt-4 text-xs font-medium text-slate-400">
            {t("profile.subscriptionPage.emptyStateHint")}
          </span>
        </div>
      )}

      {tab === "plan" && (
        <div className="space-y-8">
          {/* Tiers */}
          <section>
            <div className="mb-3 max-w-2xl">
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-lg">
                {t("profile.subscriptionPage.tiersTitle")}
              </h3>
              <p className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400 sm:text-sm">
                {t("profile.subscriptionPage.tiersSub")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:items-stretch">
              {/* Free */}
              <div className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-primary/40 bg-white shadow-sm transition hover:shadow-md dark:border-primary/35 dark:bg-slate-900">
                <div className="relative flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {t("profile.subscriptionPage.dailyLabel")}
                      </p>
                      <p className="truncate text-base font-bold text-slate-900 dark:text-slate-50">
                        {t("profile.subscriptionPage.free.name")}
                      </p>
                    </div>
                    <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
                      <Zap size={11} className="text-emerald-600" />
                      {t("profile.subscriptionPage.active")}
                    </span>
                  </div>
                  <div className="mb-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tabular-nums text-primary sm:text-4xl">
                      {FREE_CREDITS_PER_DAY}
                    </span>
                    <span className="text-sm font-bold text-primary/75">
                      {t("profile.subscriptionPage.creditUnit")}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.subscriptionPage.creditsPerDayCaption")}
                    </span>
                  </div>
                  <p className="mb-2 line-clamp-2 text-xs leading-snug text-slate-600 dark:text-slate-400">
                    {t("profile.subscriptionPage.free.desc")}
                  </p>
                  <div className="mt-auto rounded-lg bg-slate-50 px-3 py-2 text-[11px] leading-snug text-slate-500 dark:bg-slate-800/80 dark:text-slate-400">
                    {t("profile.subscriptionPage.currentPlanHint", {
                      count: PRO_CREDITS_PER_DAY,
                    })}
                  </div>
                </div>
              </div>

              {/* Pro */}
              <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-b from-violet-50/70 to-white shadow-sm transition hover:border-violet-200 dark:border-slate-700 dark:from-violet-950/25 dark:to-slate-900">
                <div className="flex flex-1 flex-col p-4 sm:p-5">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-x-2 gap-y-1">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600/85 dark:text-violet-400/90">
                        {t("profile.subscriptionPage.dailyLabel")}
                      </p>
                      <p className="flex items-center gap-1.5 text-base font-bold text-slate-900 dark:text-slate-50">
                        {t("profile.subscriptionPage.pro.name")}
                        <Crown
                          size={16}
                          className="shrink-0 text-amber-500 dark:text-amber-400"
                          strokeWidth={2}
                        />
                      </p>
                    </div>
                    <p className="max-w-[min(100%,11rem)] text-right text-xs font-bold leading-tight tabular-nums text-violet-700 dark:text-violet-300 sm:text-sm">
                      {t("profile.subscriptionPage.proSubscriptionPrice", {
                        price: formatVnd(PRO_PRICE_VND),
                      })}
                    </p>
                  </div>
                  <div className="mb-2 flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50 sm:text-4xl">
                      {PRO_CREDITS_PER_DAY}
                    </span>
                    <span className="text-sm font-bold text-slate-400 dark:text-slate-500">
                      {t("profile.subscriptionPage.creditUnit")}
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {t("profile.subscriptionPage.creditsPerDayCaption")}
                    </span>
                  </div>
                  <p className="mb-3 line-clamp-2 flex-1 text-xs leading-snug text-slate-600 dark:text-slate-400">
                    {t("profile.subscriptionPage.pro.desc")}
                  </p>
                  <Button
                    type="primary"
                    className="mt-auto h-9 w-full rounded-lg text-sm font-semibold"
                  >
                    {t("profile.subscriptionPage.upgradeToPro")}
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Top-up — paid packs (blue / cash) */}
          <section
            id={SUBSCRIPTION_ANCHOR.topup}
            className="scroll-mt-6 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50 sm:p-6"
          >
            <div className="mb-5 max-w-2xl">
              <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-xl">
                {t("profile.subscriptionPage.topupTitle")}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {t("profile.subscriptionPage.topupSub")}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {TOPUP_PACKS.map((pack, idx) => {
                const highlight = idx === 3;

                return (
                  <div
                    key={pack.price}
                    className={`group relative flex flex-col rounded-2xl border bg-white p-5 transition-all dark:bg-slate-900 ${highlight
                      ? "border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20 dark:ring-primary/25"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:hover:border-slate-600"
                      }`}
                  >
                    {highlight && (
                      <span className="absolute -top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-primary px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md">
                        {t("profile.subscriptionPage.bestValue")}
                      </span>
                    )}
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {t("profile.subscriptionPage.youReceive")}
                    </p>
                    <p className="mt-2 text-3xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
                      {pack.base}
                      <span className="ml-1 text-base font-semibold text-slate-500 dark:text-slate-400">
                        {t("profile.subscriptionPage.creditUnit")}
                      </span>
                    </p>
                    {pack.bonusPct > 0 ? (
                      <span className="mt-2 inline-flex w-fit items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        {t("profile.subscriptionPage.bonusChip", {
                          percent: pack.bonusPct,
                        })}
                      </span>
                    ) : (
                      <div className="min-h-[28px]" aria-hidden />
                    )}

                    <div className="mt-4 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <p className="text-lg font-bold tabular-nums text-slate-700 dark:text-slate-200">
                        {formatVnd(pack.price)}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="primary"
                        block
                        className="h-10 rounded-xl font-semibold"
                      >
                        {t("profile.subscriptionPage.buyNow")}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Coin → credit — wallet / amber theme (distinct from paid top-up) */}
          <section
            id={SUBSCRIPTION_ANCHOR.coin}
            className="scroll-mt-6 overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50/90 via-orange-50/40 to-amber-100/30 p-4 shadow-sm dark:border-amber-900/40 dark:from-amber-950/35 dark:via-slate-900 dark:to-amber-950/20 sm:p-6"
          >
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="max-w-2xl">
                <div className="mb-1 inline-flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-200/80 text-amber-900 shadow-sm dark:bg-amber-900/60 dark:text-amber-200">
                    <HandCoins size={18} strokeWidth={2} />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-amber-950 dark:text-amber-100 sm:text-xl">
                    {t("profile.subscriptionPage.coinExchangeTitle")}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-amber-900/75 dark:text-amber-200/80">
                  {t("profile.subscriptionPage.coinExchangeSub")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
              {COIN_EXCHANGE_PACKS.map((pack, idx) => {
                const highlight = idx === 3;
                const canAfford = coins >= pack.coins;
                const packLoading = isExchanging && exchangingCoins === pack.coins;
                const exchangeBtnClass =
                  "h-9 rounded-lg border-0 bg-gradient-to-r from-amber-600 to-orange-600 font-semibold text-white shadow-sm hover:!bg-gradient-to-r hover:from-amber-700 hover:to-orange-700 hover:!text-white disabled:!from-slate-300 disabled:!to-slate-400 dark:disabled:!from-slate-600 dark:disabled:!to-slate-600";
                return (
                  <div
                    key={pack.coins}
                    className={`relative flex flex-col rounded-xl border p-4 transition-all ${highlight
                      ? "border-amber-400 bg-white/95 shadow-md shadow-amber-900/10 ring-2 ring-amber-300/60 dark:border-amber-500 dark:bg-slate-900/95 dark:ring-amber-600/40"
                      : "border-amber-200/90 bg-white/80 hover:border-amber-300 hover:shadow-md dark:border-amber-900/50 dark:bg-slate-900/70 dark:hover:border-amber-700"
                      }`}
                  >
                    {highlight && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-600 to-orange-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                        {t("profile.subscriptionPage.bestValue")}
                      </span>
                    )}
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/90 dark:text-amber-400/90">
                      {t("profile.subscriptionPage.youReceive")}
                    </p>
                    <p className="mt-1.5 text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50 sm:text-3xl">
                      {pack.credits.toLocaleString(localeNum)}
                      <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                        {t("profile.subscriptionPage.creditUnit")}
                      </span>
                    </p>
                    <div className="my-3 border-t border-dashed border-amber-200/80 dark:border-amber-800/60" />
                    <div className="rounded-lg bg-amber-100/70 px-3 py-2.5 dark:bg-amber-950/40">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/80 dark:text-amber-400/90">
                        {t("profile.subscriptionPage.youPay")}
                      </p>
                      <p className="mt-0.5 text-base font-bold tabular-nums text-amber-950 dark:text-amber-100">
                        {t("profile.subscriptionPage.costCoins", {
                          count: pack.coins,
                        })}
                      </p>
                    </div>
                    <div className="mt-3 w-full">
                      {!canAfford ? (
                        <Tooltip title={t("profile.subscriptionPage.insufficientCoins")}>
                          <span className="block w-full">
                            <Button block disabled className={exchangeBtnClass}>
                              {t("profile.subscriptionPage.exchangeNow")}
                            </Button>
                          </span>
                        </Tooltip>
                      ) : (
                        <Button
                          block
                          loading={packLoading}
                          disabled={isExchanging}
                          className={exchangeBtnClass}
                          onClick={() =>
                            runCoinExchange(pack.coins, {
                              onSuccess: () => {
                                message.success(
                                  t("profile.subscriptionPage.exchangeSuccess", {
                                    credits: pack.credits,
                                  }),
                                );
                              },
                              onError: (err) => showApiError(err),
                            })
                          }
                        >
                          {t("profile.subscriptionPage.exchangeNow")}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Trust */}
          <footer className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-8 dark:border-slate-800 dark:bg-slate-900/60 sm:px-8">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5 text-sm text-slate-600 dark:text-slate-400 lg:grid-cols-4 lg:justify-items-center">
              {[
                { icon: Shield, label: t("profile.subscriptionPage.footer.safe"), color: "text-emerald-600 dark:text-emerald-500" },
                { icon: RotateCcw, label: t("profile.subscriptionPage.footer.refund"), color: "text-blue-600 dark:text-blue-400" },
                { icon: Headphones, label: t("profile.subscriptionPage.footer.support"), color: "text-violet-600 dark:text-violet-400" },
                { icon: Sparkles, label: t("profile.subscriptionPage.footer.quality"), color: "text-amber-500" },
              ].map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="flex items-center gap-2.5 justify-self-start lg:justify-self-center"
                >
                  <Icon size={18} className={`shrink-0 ${color}`} strokeWidth={2} />
                  <span className="leading-snug">{label}</span>
                </span>
              ))}
            </div>
            <p className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
              {t("profile.subscriptionPage.footer.copyright", {
                year: new Date().getFullYear(),
                brand: t("common.brand"),
              })}
            </p>
          </footer>
        </div>
      )}
    </div>
  );
}
