import z from "zod";

const apiKeySchema = z.object({
    id: z.number(),
    apiKey: z.string(),
    model: z.string(),
    credit: z.number(),
    isActive: z.boolean(),
    createdAt: z.string().nullable(),
});

export type ApiKey = z.infer<typeof apiKeySchema>;
export { apiKeySchema };

/** Mask API key for display (first 2 + ... + last 4 chars). */
export function maskApiKey(key: string): string {
    if (!key || key.length <= 8) return "•••";
    return `${key.slice(0, 2)}•••${key.slice(-4)}`;
}

/** Derive provider label from model (e.g. GEMINI_1_0_PRO -> Gemini). */
export function getProviderFromModel(model: string): string {
    const u = model.toUpperCase();
    if (u.startsWith("GEMINI")) return "Gemini";
    if (u.startsWith("GPT")) return "OpenAI";
    if (u.startsWith("CLAUDE")) return "Claude";
    return model.split("_")[0] || model;
}
