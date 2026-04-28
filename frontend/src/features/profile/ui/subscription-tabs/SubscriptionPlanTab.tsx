import { Button, Tooltip, message } from "antd";
import { Crown, HandCoins, Zap } from "lucide-react";
import { useTranslation } from "react-i18next";

import {
  COIN_EXCHANGE_PACKS,
  FREE_CREDITS_PER_DAY,
  PRO_CREDITS_PER_DAY,
  PRO_PRICE_VND,
} from "../../constant";
import { SUBSCRIPTION_ANCHOR } from "../../subscriptionAnchors";
import { useExchangeCoins } from "@/features/credits/useExchangeCoins";
import { showApiError } from "@/shared/api/showApiError";

function formatVnd(n: number) {
  return `${n.toLocaleString("vi-VN")}đ`;
}

type SubscriptionPlanTabProps = {
  coins: number;
  localeNum: string;
};

export function SubscriptionPlanTab({
  coins,
  localeNum,
}: SubscriptionPlanTabProps) {
  const { t } = useTranslation();
  const {
    mutate: runCoinExchange,
    isPending: isExchanging,
    variables: exchangingCoins,
  } = useExchangeCoins();

  return (
    <div className="space-y-8">
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
                    price: `???.000`,
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
                disabled
                type="default"
                className="mt-auto h-9 w-full rounded-lg text-sm font-semibold"
              >
                {t("profile.subscriptionPage.emptyStateHint")}
              </Button>
            </div>
          </div>
        </div>
      </section>

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
                className={`relative flex flex-col rounded-xl border p-4 transition-all ${
                  highlight
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
                    <Tooltip
                      title={t("profile.subscriptionPage.insufficientCoins")}
                    >
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

      {/* <section
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
                className={`group relative flex flex-col rounded-2xl border bg-white p-5 transition-all dark:bg-slate-900 ${
                  highlight
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
                  <Button disabled type="default" block className="h-10 rounded-xl font-semibold">
                    {t("profile.subscriptionPage.emptyStateHint")}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section> */}
    </div>
  );
}
