import { useTranslation } from "react-i18next";
import { Receipt } from "lucide-react";

export function HistoryTransactionSection() {
  const { t } = useTranslation();

  return (
    <div className="flex-1 min-w-0 space-y-6">
      <div className="bg-white dark:bg-slate-900/90 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 mb-4">
          <Receipt size={28} />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          {t("profile.historyTransactionsTitle")}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {t("profile.historyTransactionsEmpty")}
        </p>
      </div>
    </div>
  );
}
