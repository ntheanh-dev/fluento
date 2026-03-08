import type { ApiResponse } from "@/shared/api/type";
import { http } from "@/shared/api/http-client";
import type { UserPractice } from "@/entities/userPractice/schema";

export type Page<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
};

export type GetHistoryParams = {
  page?: number;
  size?: number;
  type?: string;
  topic?: string;
  level?: string;
  search?: string;
  sort?: "asc" | "desc";
};

export function getHistory(params: GetHistoryParams): Promise<Page<UserPractice>> {
  return http
    .get<ApiResponse<Page<UserPractice>>>("/user-practices", { params })
    .then((res) => res.data.result);
}
