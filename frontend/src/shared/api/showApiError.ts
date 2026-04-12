import { message } from "antd";
import { AxiosError } from "axios";
import type { ApiError } from "./type";
import i18n from "@/i18n";

export const DEFAULT_API_ERROR_MESSAGE = () => i18n.t("errors.default");

/**
 * Hiển thị thông báo lỗi từ API (Ant Design message).
 * Nếu error là AxiosError và response.data có dạng ApiError thì dùng message từ API,
 * không thì dùng fallback.
 */
export function showApiError(
  error: unknown,
  fallback?: string
): void {
  const appError = (error as AxiosError)?.response?.data as ApiError | undefined;
  const msg = fallback ?? DEFAULT_API_ERROR_MESSAGE();
  if (appError?.message) {
    message.error(appError.message, 5);
  } else {
    message.error(msg);
  }
}
