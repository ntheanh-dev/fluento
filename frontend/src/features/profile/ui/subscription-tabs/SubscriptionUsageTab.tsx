import { useState } from "react";
import { Pagination } from "antd";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSubscriptionUsage } from "../../query";
import type { UsageSortDir, UsageSortField } from "../../api";
import { AppSpinner } from "@/shared/components/AppSpinner";

export function SubscriptionUsageTab() {
  const { t, i18n } = useTranslation();
  const localeNum = i18n.language.startsWith("vi") ? "vi-VN" : "en-US";
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<UsageSortField>("createdAt");
  const [sortDir, setSortDir] = useState<UsageSortDir>("desc");
  const pageSize = 10;
  const { data, isLoading, isFetching } = useSubscriptionUsage(page, pageSize, sortBy, sortDir);

  const onSort = (field: UsageSortField) => {
    setPage(0);
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortDir("desc");
  };

  const renderSortIcon = (field: UsageSortField) => {
    if (sortBy !== field) {
      return <ChevronsUpDown size={12} className="text-slate-400 dark:text-slate-500" />;
    }
    return sortDir === "asc" ? (
      <ArrowUp size={12} className="text-primary dark:text-sky-400" />
    ) : (
      <ArrowDown size={12} className="text-primary dark:text-sky-400" />
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
        <AppSpinner className="py-0" />
      </div>
    );
  }

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const thBtnClass =
    "inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 font-semibold normal-case tracking-normal text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700/70 dark:hover:text-slate-100";

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
        <div className="border-b border-slate-200 bg-slate-50/90 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            {t("profile.subscriptionPage.usage.recentTransactions")}
          </p>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("profile.subscriptionPage.usage.noTransactions")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">
                    <button type="button" className={thBtnClass} onClick={() => onSort("type")}>
                      {t("profile.subscriptionPage.usage.table.type")} {renderSortIcon("type")}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" className={thBtnClass} onClick={() => onSort("amount")}>
                      {t("profile.subscriptionPage.usage.table.amount")} {renderSortIcon("amount")}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" className={thBtnClass} onClick={() => onSort("status")}>
                      {t("profile.subscriptionPage.usage.table.status")} {renderSortIcon("status")}
                    </button>
                  </th>
                  <th className="px-4 py-3">
                    <button type="button" className={thBtnClass} onClick={() => onSort("createdAt")}>
                      {t("profile.subscriptionPage.usage.table.time")} {renderSortIcon("createdAt")}
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((tx) => (
                  <tr key={tx.id} className="text-slate-700 transition hover:bg-slate-50/70 dark:text-slate-200 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium">{t(`profile.subscriptionPage.usage.type.${tx.type}`)}</td>
                    <td className={`px-4 py-3 font-semibold tabular-nums ${tx.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {tx.amount > 0 ? "+" : ""}
                      {tx.amount.toLocaleString(localeNum)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {t(`profile.subscriptionPage.usage.status.${tx.status}`)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(tx.createdAt).toLocaleString(localeNum)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-2 flex justify-center">
        <Pagination
          className="flex justify-center"
          current={page + 1}
          total={totalElements}
          pageSize={pageSize}
          showSizeChanger={false}
          disabled={isFetching}
          onChange={(nextPage) => setPage(nextPage - 1)}
        />
      </div>
    </div>
  );
}
