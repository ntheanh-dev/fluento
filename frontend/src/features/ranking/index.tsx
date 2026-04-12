import React, { useMemo, useState } from "react";
import { Trophy, Flame, Search, Clock, User } from "lucide-react";
import { Avatar, Spin, Pagination } from "antd";
import { useRankings } from "./query";
import { useDebounce } from "../../shared/hooks/useDebounce";
import { formatTotalHours } from "@/utils/utils";
import { useTranslation } from "react-i18next";

const Rankings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const numLocale = useMemo(
    () => (i18n.language.startsWith("en") ? "en-US" : "vi-VN"),
    [i18n.language],
  );
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const debouncedKeyword = useDebounce(keyword, 400);

  const { data, isLoading, isError } = useRankings({
    page,
    size,
    keyword: debouncedKeyword || undefined,
  });

  const rows = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const currentPage = data?.number ?? page;
  const showPagination = !!data && data.totalElements > data.size;

  const {
    data: podiumData,
    isLoading: podiumLoading,
    isError: podiumError,
  } = useRankings({ page: 0, size: 3 });

  const podium = podiumData?.content ?? [];
  const first = podium[0];
  const second = podium[1] ?? podium[0];
  const third = podium[2] ?? podium[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-3 mb-8 sm:mb-10">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            {t("ranking.title")}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
            {t("ranking.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-center items-stretch md:items-end gap-6 md:gap-4 mb-10 md:mb-12">
        {podiumLoading || podiumError || !first ? (
          <div className="py-10 flex justify-center items-center w-full">
            {podiumLoading ? (
              <Spin />
            ) : (
              <span className="text-sm text-red-500">{t("ranking.loadTop3Error")}</span>
            )}
          </div>
        ) : (
          <>
            {second && (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-300 dark:border-slate-600 overflow-hidden">
                    <img
                      src={second.urlAvatar || "https://picsum.photos/seed/2/200"}
                      alt={second.fullName || t("ranking.rank2")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                    {second.rank}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900/90 w-full sm:w-56 pt-6 pb-4 rounded-t-2xl border-t-4 border-slate-300 dark:border-slate-600 shadow-sm text-center">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    {second.fullName || t("ranking.anonymous")}
                  </h3>
                  <p className="text-primary font-bold text-lg">
                    {(second.totalUserSentenceAnswers ?? 0).toLocaleString(numLocale)}{" "}
                    {t("ranking.sentences")}
                  </p>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded mt-1 inline-block">
                    {t("ranking.avgShort", {
                      score: second.avgScore?.toFixed(1) ?? "0.0",
                    })}
                  </span>
                  <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                    <Clock size={10} /> {formatTotalHours(second.totalLearningTime ?? 0)}
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center z-10 md:-mx-2">
              <div className="relative mb-6">
                <Trophy
                  className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-400 fill-current animate-bounce"
                  size={32}
                />
                <div className="w-28 h-28 rounded-full border-4 border-amber-400 overflow-hidden shadow-lg">
                  <img
                    src={first.urlAvatar || "https://picsum.photos/seed/1/200"}
                    alt={first.fullName || t("ranking.rank1")}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-white">
                  {first.rank}
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900/90 w-full sm:w-64 pt-8 pb-6 rounded-t-2xl border-t-4 border-amber-400 shadow-lg text-center relative">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-amber-50 dark:from-amber-950/30 to-transparent opacity-50"></div>
                <div className="relative">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">
                    {first.fullName || t("ranking.anonymous")}
                  </h3>
                  <p className="text-primary font-extrabold text-2xl">
                    {(first.totalUserSentenceAnswers ?? 0).toLocaleString(numLocale)}{" "}
                    {t("ranking.sentences")}
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wide">
                    {t("ranking.avgShort", {
                      score: first.avgScore?.toFixed(1) ?? "0.0",
                    })}
                  </span>
                  <div className="mt-2 text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Flame size={12} />{" "}
                    {t("ranking.streakLine", { count: first.currentStreak ?? 0 })}
                  </div>
                  <div className="mt-1 text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Clock size={12} /> {formatTotalHours(first.totalLearningTime ?? 0)}
                  </div>
                </div>
              </div>
            </div>

            {third && (
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-full border-4 border-orange-700 overflow-hidden">
                    <img
                      src={third.urlAvatar || "https://picsum.photos/seed/3/200"}
                      alt={third.fullName || t("ranking.rank3")}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-orange-700 rounded-full flex items-center justify-center text-white font-bold text-xs border-2 border-white">
                    {third.rank}
                  </div>
                </div>
                <div className="bg-white dark:bg-slate-900/90 w-full sm:w-56 pt-6 pb-4 rounded-t-2xl border-t-4 border-orange-700 shadow-sm text-center">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">
                    {third.fullName || t("ranking.anonymous")}
                  </h3>
                  <p className="text-primary font-bold text-lg">
                    {(third.totalUserSentenceAnswers ?? 0).toLocaleString(numLocale)}{" "}
                    {t("ranking.sentences")}
                  </p>
                  <span className="text-[10px] bg-orange-50 dark:bg-orange-950/40 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded mt-1 inline-block">
                    {t("ranking.avgShort", {
                      score: third.avgScore?.toFixed(1) ?? "0.0",
                    })}
                  </span>
                  <div className="mt-1 text-[10px] text-slate-400 flex items-center justify-center gap-0.5">
                    <Clock size={10} /> {formatTotalHours(third.totalLearningTime ?? 0)}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-slate-50/50 dark:bg-slate-950/50">
          <h2 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100">
            {t("ranking.detailTitle")}
          </h2>
          <div className="relative w-full sm:w-auto">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder={t("ranking.searchPlaceholder")}
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setPage(0);
              }}
              className="w-full sm:w-64 pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        {isLoading ? (
          <div className="py-10 flex justify-center items-center">
            <Spin />
          </div>
        ) : isError ? (
          <div className="py-10 text-center text-sm text-red-500">
            {t("ranking.loadError")}
          </div>
        ) : (
          <>
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <thead className="bg-white dark:bg-slate-900 text-xs uppercase text-slate-400 font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">{t("ranking.colRank")}</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">{t("ranking.colLearner")}</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">{t("ranking.colAvg")}</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">{t("ranking.colSentences")}</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">{t("ranking.colTime")}</th>
                    <th className="px-4 sm:px-6 py-3 sm:py-4">{t("ranking.colStreak")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {rows.map((row) => (
                    <tr
                      key={row.rank}
                      className="hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-500 dark:text-slate-400">
                        #{row.rank}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-3">
                          {row.urlAvatar ? (
                            <img
                              src={row.urlAvatar}
                              alt={row.fullName || t("ranking.anonymous")}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-slate-100 dark:border-slate-700 shadow-sm"
                            />
                          ) : (
                            <Avatar size={32} icon={<User size={16} />} />
                          )}
                          <span className="font-semibold text-slate-900 dark:text-slate-100 group-hover:text-primary transition-colors">
                            {row.fullName || t("ranking.anonymous")}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="bg-primary h-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  (row.avgScore ?? 0) * 10,
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {row.avgScore?.toFixed(1) ?? "0.0"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {row.totalUserSentenceAnswers?.toLocaleString(numLocale) ?? 0}
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-slate-400" />
                          {formatTotalHours(row.totalLearningTime ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4">
                        <div className="flex items-center gap-1 text-orange-500 font-bold text-xs">
                          <Flame size={14} /> {row.currentStreak ?? 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showPagination && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
                  {t("ranking.learnerCount", { count: totalElements })}
                </div>
                <div className="order-1 sm:order-2">
                  <Pagination
                    current={currentPage + 1}
                    total={totalElements}
                    pageSize={size}
                    showSizeChanger={false}
                    onChange={(p) => setPage(p - 1)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Rankings;
