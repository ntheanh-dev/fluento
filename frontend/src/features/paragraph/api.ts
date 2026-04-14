import type { ApiResponse } from "@/shared/api/type";
import { http } from "@/shared/api/http-client";
import type { Page, ParagraphItem, ParagraphListParams } from "./schema";
import type { UserPractice } from "@/entities/userPractice/schema";

export function getParagraphs(params: ParagraphListParams): Promise<Page<ParagraphItem>> {
  return http
    .get<ApiResponse<Page<ParagraphItem>>>("/paragraphs", { params })
    .then((res) => res.data.result);
}

export function createUserPractice(paragraphId: number): Promise<UserPractice> {
  return http
    .post<ApiResponse<UserPractice>>(`/user-practices/${paragraphId}`)
    .then((res) => res.data.result);
}
