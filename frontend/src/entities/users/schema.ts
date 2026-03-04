import z from "zod";
import type { Resource } from "../../shared/api/type";
import { apiKeySchema } from "../apiKey/schema";

const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string(),
    email: z.string(),
    password: z.string(),
    urlAvatar: z.string(),
    noPassword: z.boolean(),
    createdAt: z.string(),
    activeApiKeyId: z.number(),
    embedded: z
        .object({
            apiKey: z.array(apiKeySchema).optional(),
        })
        .optional(),
    currentStreak: z.number(),
    longestStreak: z.number(),
});

export type User = z.infer<typeof userSchema> & Resource;