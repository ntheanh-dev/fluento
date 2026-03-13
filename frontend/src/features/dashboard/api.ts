import type { ApiResponse } from "@/shared/api/type";
import { http } from "@/shared/api/http-client";

export type WritingPerformanceRange = "LAST_7_DAYS" | "LAST_30_DAYS";

export type WritingPerformancePoint = {
  date: string; // yyyy-MM-dd
  label: string; // "Mon" | "Tue" | ...
  score: number;
  totalSentences: number;
};

export type WritingPerformanceSeries = {
  range: WritingPerformanceRange;
  points: WritingPerformancePoint[];
};

export function getWritingPerformance(range: WritingPerformanceRange): Promise<WritingPerformanceSeries> {
  return http
    .get<ApiResponse<WritingPerformanceSeries>>("/user-practices/writing-performance", { params: { range } })
    .then((res) => res.data.result);
}

