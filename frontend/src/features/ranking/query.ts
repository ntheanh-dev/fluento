import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Page } from "./api";
import { getRankings, type RankingItem, type GetRankingsParams } from "./api";
import { OK } from "../../shared/api/query-keys";

export function useRankings(params: GetRankingsParams) {
  const { page = 0, size = 10, keyword } = params;

  return useQuery<Page<RankingItem>>({
    queryKey: [OK.RANKINGS, page, size, keyword ?? ""],
    queryFn: () => getRankings({ page, size, keyword }),
    placeholderData: keepPreviousData,
  });
}

