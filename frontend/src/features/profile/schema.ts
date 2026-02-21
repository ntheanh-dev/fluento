import { z } from "zod";
import { PASSWORD_MIN, PASSWORD_MAX } from "../../shared/validation/constant";

const newPasswordField = z
    .string()
    .min(PASSWORD_MIN, `Mật khẩu phải có ít nhất ${PASSWORD_MIN} ký tự`)
    .max(PASSWORD_MAX, `Mật khẩu không được vượt quá ${PASSWORD_MAX} ký tự`);

const confirmPasswordField = z
    .string()
    .min(PASSWORD_MIN, `Mật khẩu xác nhận phải có ít nhất ${PASSWORD_MIN} ký tự`)
    .max(PASSWORD_MAX, `Mật khẩu xác nhận không được vượt quá ${PASSWORD_MAX} ký tự`);

/** noPassword = true: first-time set (không verify current). noPassword = false: đổi mật khẩu (bắt buộc current). */
export function getSetPasswordSchema(noPassword: boolean) {
    return z
        .object({
            currentPassword: noPassword
                ? z.string().optional()
                : z.string().min(1, "Vui lòng nhập mật khẩu hiện tại"),
            newPassword: newPasswordField,
            confirmPassword: confirmPasswordField,
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: "Mật khẩu xác nhận không khớp",
            path: ["confirmPassword"],
        });
}

export type SetPasswordInput = {
    currentPassword?: string;
    newPassword: string;
    confirmPassword: string;
};
