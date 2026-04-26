import type { ApiResponse } from "@/shared/api/type";
import { http } from "@/shared/api/http-client";
import type { Page, ParagraphItem, ParagraphListParams } from "./schema";
import type { UserPractice } from "@/entities/userPractice/schema";
import type { TargetLanguage } from "@/shared/constants/target-language";

export function getParagraphs(params: ParagraphListParams): Promise<Page<ParagraphItem>> {
  return http
    .get<ApiResponse<Page<ParagraphItem>>>("/paragraphs", { params })
    .then((res) => res.data.result);
}

export function createUserPractice(paragraphId: number, targetLanguage: TargetLanguage): Promise<UserPractice> {
  return http
    .post<ApiResponse<UserPractice>>(`/user-practices/${paragraphId}?targetLanguage=${targetLanguage}`)
    .then((res) => res.data.result);
}
