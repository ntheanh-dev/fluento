import { useTranslation } from "react-i18next";

export const Analyzing = () => {
    const { t } = useTranslation();
    return (
        <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="px-6 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-100 dark:border-blue-900/50 flex items-center gap-3">
                <div className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                </div>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {t("practice.session.analyzing")}
                </span>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded"></div>
                            <div className="h-px bg-slate-100 dark:bg-slate-700 flex-1"></div>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/80 rounded-lg p-4 border border-slate-100 dark:border-slate-800 space-y-3">
                            <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
