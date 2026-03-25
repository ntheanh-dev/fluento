import z from "zod";
import type { Resource } from "../../shared/api/type";
import { apiKeySchema } from "../apiKey/schema";

const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string(),
    // Backend profile response does not always include email/password; keep them optional for type-safety.
    email: z.string().optional(),
    password: z.string().optional(),
    urlAvatar: z.string(),
    noPassword: z.boolean(),
    createdAt: z.string(),
    activeApiKeyId: z.number(),
    // Returned by admin/user mappers (backend includes this field); keep optional for safety
    // in case some endpoints omit it.
    credits: z.number().optional(),
    roles: z
        .array(
            z.object({
                name: z.string(),
            }),
        )
        .optional(),
    embedded: z
        .object({
            apiKey: z.array(apiKeySchema).optional(),
            totalUserSentenceAnswers: z.number().optional(),
            avgUserSentenceAnswerScore: z.number().optional(),
            totalLearningTime: z.number().optional(),
        })
        .optional(),
    currentStreak: z.number(),
    longestStreak: z.number(),
});

export type User = z.infer<typeof userSchema> & Resource;