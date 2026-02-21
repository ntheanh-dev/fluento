import { z } from "zod";

const loginInputSchema = z
    .object({
        username: z
            .string()
            .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
            .max(30, "Tên đăng nhập không được vượt quá 30 ký tự"),
        password: z
            .string()
            .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
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
        username: z
            .string()
            .min(8, "Tên đăng nhập phải có ít nhất 8 ký tự")
            .max(30, "Tên đăng nhập không được vượt quá 30 ký tự"),
        password: z
            .string()
            .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
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