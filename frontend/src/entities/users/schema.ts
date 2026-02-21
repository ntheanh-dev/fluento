import z from "zod";

const userSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    password: z.string(),
    urlAvatar: z.string(),
    noPassword: z.boolean(),
    createdAt: z.string(),
});

export type User = z.infer<typeof userSchema>;