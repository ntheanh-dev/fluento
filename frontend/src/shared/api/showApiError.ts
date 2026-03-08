import { message } from "antd";
import { AxiosError } from "axios";
import type { ApiError } from "./type";

export const DEFAULT_API_ERROR_MESSAGE =
  "Đã xảy ra lỗi không xác định. Vui lòng thử lại sau.";

/**
 * Hiển thị thông báo lỗi từ API (Ant Design message).
 * Nếu error là AxiosError và response.data có dạng ApiError thì dùng message từ API,
 * không thì dùng fallback.
 */
export function showApiError(
  error: unknown,
  fallback = DEFAULT_API_ERROR_MESSAGE
): void {
  const appError = (error as AxiosError)?.response?.data as ApiError | undefined;
  if (appError?.message) {
    message.error(appError.message, 5);
  } else {
    message.error(fallback);
  }
}
