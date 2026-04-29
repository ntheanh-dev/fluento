import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { Page } from "./api";
import {
  getCurrentUserRanking,
  getRankings,
  type RankingItem,
  type GetRankingsParams,
} from "./api";
import { OK } from "../../shared/api/query-keys";

export function useRankings(params: GetRankingsParams) {
  const { page = 0, size = 10 } = params;

  return useQuery<Page<RankingItem>>({
    queryKey: [OK.RANKINGS, page, size],
    queryFn: () => getRankings({ page, size }),
    placeholderData: keepPreviousData,
  });
}

export function useCurrentUserRanking() {
  return useQuery<RankingItem>({
    queryKey: [OK.RANKINGS, "me"],
    queryFn: getCurrentUserRanking,
  });
}

