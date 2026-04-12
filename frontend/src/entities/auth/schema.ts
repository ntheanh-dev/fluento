import { z } from "zod";

/** Shared input types (validation messages come from i18n in forms). */
export type LoginInput = {
  username: string;
  password: string;
};

export type RegisterInput = {
  fullName: string;
  username: string;
  password: string;
};

const loginOutputSchema = z
  .object({
    accessToken: z.string(),
  })
  .strict()
  .passthrough();

export type LoginOutput = z.infer<typeof loginOutputSchema>;
export { loginOutputSchema };

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
