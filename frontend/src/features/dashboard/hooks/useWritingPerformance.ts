import { useQuery } from "@tanstack/react-query";
import { getWritingPerformance, type WritingPerformanceRange, type WritingPerformanceSeries } from "../api";
import { OK } from "@/shared/api/query-keys";

export function useWritingPerformance(range: WritingPerformanceRange) {
  return useQuery<WritingPerformanceSeries>({
    queryKey: OK.writingPerformance(range),
    queryFn: () => getWritingPerformance(range),
  });
}

