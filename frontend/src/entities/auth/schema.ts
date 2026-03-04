import { z } from "zod";
import { PASSWORD_MAX, PASSWORD_MIN } from "../../shared/validation/constant";

const loginInputSchema = z
    .object({
        username: z
            .string()
            .min(8, "Tên đăng nhập phải có ít nhất 8 ký tự")
            .max(20, "Tên đăng nhập không được vượt quá 20 ký tự"),
        password: z
            .string()
            .min(PASSWORD_MIN, `Mật khẩu phải có ít nhất ${PASSWORD_MIN} ký tự`)
            .max(20, "Mật khẩu không được vượt quá 20 ký tự"),
    })
    .strict()
    .passthrough();

export type LoginInput = z.infer<typeof loginInputSchema>;
export { loginInputSchema };

const loginOutputSchema = z
    .object({
        accessToken: z.string(),
    })
    .strict()
    .passthrough();

export type LoginOutput = z.infer<typeof loginOutputSchema>;
export { loginOutputSchema };

const registerInputSchema = z
    .object({
        fullName: z
            .string()
            .min(2, "Họ tên phải có ít nhất 2 ký tự")
            .max(100, "Họ tên không được vượt quá 100 ký tự"),
        username: z
            .string()
            .min(8, "Tên đăng nhập phải có ít nhất 8 ký tự")
            .max(20, "Tên đăng nhập không được vượt quá 20 ký tự"),
        password: z
            .string()
            .min(PASSWORD_MIN, `Mật khẩu phải có ít nhất ${PASSWORD_MIN} ký tự`)
            .max(20, "Mật khẩu không được vượt quá 20 ký tự"),
    })
    .strict()
    .passthrough();

export type RegisterInput = z.infer<typeof registerInputSchema>;
export { registerInputSchema };

const registerOutputSchema = z
    .object({
        accessToken: z.string(),
    })
    .strict()
    .passthrough();

export type RegisterOutput = z.infer<typeof registerOutputSchema>;
export { registerOutputSchema };

/** Response from OAuth code exchange (e.g. Google) */
export type OAuthOutput = {
    accessToken: string;
};