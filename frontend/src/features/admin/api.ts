import { createRestClient, getResource } from "@/shared/api/rest-client";
import { http } from "@/shared/api/http-client";

import type { User } from "@/entities/users/schema";
import type { ApiResponse } from "@/shared/api/type";
import type { Paragraph } from "@/entities/paragraph/schema";
import type { ParagraphSentence } from "@/entities/paragraphSentence/schema";
import type { UserPractice } from "@/entities/userPractice/schema";
import type { PracticeSetupInput } from "@/features/practice/schema";

export type AdminPage<T> = {
  content: T[];
  totalElements: number;
  number: number;
  size: number;
};

export type AdminRolePermission = {
  name: string;
  description?: string;
};

export type AdminRole = {
  name: string;
  description?: string;
  permissions?: AdminRolePermission[];
};

export type AdminCreditTransaction = {
  id: number;
  userId: number | null;
  username: string | null;
  amount: number;
  type: string;
  status: string;
  referenceId?: string | null;
  createdAt: string;
};

export const adminListUsers = async (page: number, size: number): Promise<AdminPage<User>> => {
  return getResource<AdminPage<User>>(`/admin/users?page=${page}&size=${size}`);
};

export const adminGetUser = async (id: number): Promise<User> => {
  return getResource<User>(`/admin/users/${id}`);
};

export type UpdateUserAdminPayload = {
  fullName?: string;
  credits?: number;
  roleNames?: string[];
};

export const adminUpdateUser = async (id: number, payload: UpdateUserAdminPayload): Promise<User> => {
  const res = await http.put<ApiResponse<User>>(`/admin/users/${id}`, payload);
  return res.data.result;
};

export const adminDeleteUser = async (id: number): Promise<void> => {
  await http.delete<ApiResponse<void>>(`/admin/users/${id}`);
};

export type AdminParagraphListParams = {
  page: number;
  size: number;
  type?: string;
  tone?: string;
  topic?: string;
  level?: string;
  sentenceCount?: string;
};

export const adminListParagraphs = async (params: AdminParagraphListParams): Promise<AdminPage<Paragraph>> => {
  const { page, size, type, tone, topic, level, sentenceCount } = params;
  let url = `/admin/paragraphs?page=${page}&size=${size}`;
  if (type) url += `&type=${encodeURIComponent(type)}`;
  if (tone) url += `&tone=${encodeURIComponent(tone)}`;
  if (topic) url += `&topic=${encodeURIComponent(topic)}`;
  if (level) url += `&level=${encodeURIComponent(level)}`;
  if (sentenceCount) url += `&sentenceCount=${encodeURIComponent(sentenceCount)}`;
  return getResource<AdminPage<Paragraph>>(url);
};

export const adminCreateParagraph = async (payload: PracticeSetupInput): Promise<Paragraph> => {
  const res = await http.post<ApiResponse<Paragraph>>(`/admin/paragraphs`, payload);
  return res.data.result;
};

export const adminDeleteParagraph = async (id: number): Promise<void> => {
  await http.delete<ApiResponse<void>>(`/admin/paragraphs/${id}`);
};

export const adminUpdateParagraphTitle = async (
  id: number,
  payload: { title: string },
): Promise<Paragraph> => {
  const res = await http.put<ApiResponse<Paragraph>>(`/admin/paragraphs/${id}`, payload);
  return res.data.result;
};

export type AdminUserPracticeFilters = {
  userId?: number;
  type?: string;
  topic?: string;
  level?: string;
  search?: string;
  sort?: "asc" | "desc";
  page?: number;
  size?: number;
};

export const adminListUserPractices = async (filters: AdminUserPracticeFilters): Promise<
  AdminPage<UserPractice>
> => {
  const page = filters.page ?? 0;
  const size = filters.size ?? 12;
  const sort = filters.sort ?? "desc";

  const url =
    `/admin/user-practices?page=${page}&size=${size}&sort=${sort}` +
    (filters.userId != null ? `&userId=${filters.userId}` : "") +
    (filters.type ? `&type=${filters.type}` : "") +
    (filters.topic ? `&topic=${filters.topic}` : "") +
    (filters.level ? `&level=${filters.level}` : "") +
    (filters.search ? `&search=${encodeURIComponent(filters.search)}` : "");

  return getResource<AdminPage<UserPractice>>(url);
};

export const adminListCreditTransactions = async (params: {
  userId?: number;
  page: number;
  size: number;
}): Promise<AdminPage<AdminCreditTransaction>> => {
  const url =
    `/admin/credit-transactions?page=${params.page}&size=${params.size}` +
    (params.userId != null ? `&userId=${params.userId}` : "");
  return getResource<AdminPage<AdminCreditTransaction>>(url);
};

export const adminListRoles = async (): Promise<AdminRole[]> => {
  const res = await http.get<ApiResponse<AdminRole[]>>(`/admin/roles`);
  return res.data.result;
};

export const adminListParagraphSentencesByParagraphId = async (
  paragraphId: number,
): Promise<ParagraphSentence[]> => {
  return getResource<ParagraphSentence[]>(`/admin/paragraph-sentences/by-paragraph/${paragraphId}`);
};

export const adminGenerateParagraphSentenceHints = async (sentenceId: number): Promise<ParagraphSentence> => {
  return createRestClient<ParagraphSentence>(`/admin/paragraph-sentences/${sentenceId}/hints/generate`, {});
};

export const adminDeleteParagraphSentence = async (sentenceId: number): Promise<void> => {
  await http.delete<ApiResponse<void>>(`/admin/paragraph-sentences/${sentenceId}`);
};

export const adminUpdateParagraphSentenceContent = async (
  sentenceId: number,
  payload: { content: string },
): Promise<ParagraphSentence> => {
  const res = await http.put<ApiResponse<ParagraphSentence>>(
    `/admin/paragraph-sentences/${sentenceId}`,
    payload,
  );
  return res.data.result;
};

