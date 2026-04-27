import { z } from "zod";

export type VocabularyTargetLanguage = "EN" | "ZH" | "KO";

export type UpdateVocabularyPayload = {
  text: string;
  meaning?: string;
  partOfSpeech?: string;
  pronunciation?: string;
};

export const updateVocabularySchema = z.object({
  text: z
    .string()
    .trim()
    .min(1, "Nhập từ vựng")
    .max(255, "Từ vựng tối đa 255 ký tự"),
  meaning: z
    .string()
    .trim()
    .max(2000, "Nghĩa tối đa 2000 ký tự")
    .optional()
    .or(z.literal("")),
  partOfSpeech: z
    .string()
    .trim()
    .max(100, "Từ loại tối đa 100 ký tự")
    .optional()
    .or(z.literal("")),
  pronunciation: z
    .string()
    .trim()
    .max(255, "Phiên âm tối đa 255 ký tự")
    .optional()
    .or(z.literal("")),
});

export type UpdateVocabularyFormValues = z.infer<
  typeof updateVocabularySchema
>;
