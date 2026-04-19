import z from "zod";
import type { Resource } from "../../shared/api/type";

const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    fullName: z.string(),
    email: z.string().optional(),
    password: z.string().optional(),
    urlAvatar: z.string(),
    noPassword: z.boolean(),
    createdAt: z.string(),
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
            totalUserSentenceAnswers: z.number().optional(),
            avgUserSentenceAnswerScore: z.number().optional(),
            totalLearningTime: z.number().optional(),
        })
        .optional(),
    currentStreak: z.number(),
    longestStreak: z.number(),
});

export type User = z.infer<typeof userSchema> & Resource;
