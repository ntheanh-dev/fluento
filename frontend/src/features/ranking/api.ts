import { http } from "../../shared/api/http-client";
import type { ApiResponse } from "../../shared/api/type";

export type RankingItem = {
  rank: number;
  fullName: string | null;
  urlAvatar: string | null;
  avgScore: number;
  totalUserSentenceAnswers: number;
  currentStreak: number;
};

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

export type GetRankingsParams = {
  page?: number;
  size?: number;
  keyword?: string;
};

export function getRankings(params: GetRankingsParams): Promise<Page<RankingItem>> {
  return http
    .get<ApiResponse<Page<RankingItem>>>("/users/rankings", { params })
    .then((res) => res.data.result);
}

