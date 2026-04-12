import type { TFunction } from "i18next";
import { z } from "zod";
import { PASSWORD_MIN, PASSWORD_MAX } from "../../shared/validation/constant";

/** noPassword = true: first-time set (không verify current). noPassword = false: đổi mật khẩu (bắt buộc current). */
export function getSetPasswordSchema(noPassword: boolean, t: TFunction) {
    const newPasswordField = z
        .string()
        .min(PASSWORD_MIN, t("validation.passwordMin", { min: PASSWORD_MIN }))
        .max(PASSWORD_MAX, t("validation.passwordMax"));

    const confirmPasswordField = z
        .string()
        .min(PASSWORD_MIN, t("validation.passwordMin", { min: PASSWORD_MIN }))
        .max(PASSWORD_MAX, t("validation.passwordMax"));

    return z
        .object({
            currentPassword: noPassword
                ? z.string().optional()
                : z.string().min(1, t("validation.currentPasswordRequired")),
            newPassword: newPasswordField,
            confirmPassword: confirmPasswordField,
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            message: t("validation.passwordConfirmMismatch"),
            path: ["confirmPassword"],
        });
}
