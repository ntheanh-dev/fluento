import { message } from "antd";
import { AxiosError } from "axios";
import type { ApiError } from "./type";
import i18n from "@/i18n";

export const DEFAULT_API_ERROR_MESSAGE = () => i18n.t("errors.default");

function extractMessage(error: unknown): string | undefined {
  const responseData = (error as { response?: { data?: unknown } })?.response?.data as
    | (ApiError & { result?: { message?: string }; error?: string })
    | undefined;

  if (responseData?.message) return responseData.message;
  if (responseData?.result?.message) return responseData.result.message;
  if (responseData?.error) return responseData.error;

  const axiosData = (error as AxiosError)?.response?.data as
    | (ApiError & { result?: { message?: string }; error?: string })
    | undefined;

  if (axiosData?.message) return axiosData.message;
  if (axiosData?.result?.message) return axiosData.result.message;
  if (axiosData?.error) return axiosData.error;

  if (typeof error === "string" && error.trim()) return error;

  if (error instanceof Error && error.message?.trim()) {
    return error.message;
  }

  if (error && typeof error === "object") {
    const obj = error as {
      message?: unknown;
      error?: unknown;
      result?: { message?: unknown };
    };
    if (typeof obj.message === "string" && obj.message.trim()) return obj.message;
    if (typeof obj.error === "string" && obj.error.trim()) return obj.error;
    if (typeof obj.result?.message === "string" && obj.result.message.trim()) {
      return obj.result.message;
    }
  }

  return undefined;
}

/**
 * Hiển thị thông báo lỗi từ API (Ant Design message).
 * Nếu error là AxiosError và response.data có dạng ApiError thì dùng message từ API,
 * không thì dùng fallback.
 */
export function showApiError(
  error: unknown,
  fallback?: string
): void {
  const msg = fallback ?? DEFAULT_API_ERROR_MESSAGE();
  message.error(extractMessage(error) ?? msg, 5);
}
