import type { VocabularyTargetLanguage } from "@/features/vocabulary/schema";
import type { ComponentType } from "react";
import { z } from "zod";
import {
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Dumbbell,
  Film,
  Globe2,
  GraduationCap,
  HeartPulse,
  Landmark,
  Music2,
  Plane,
  UtensilsCrossed,
} from "lucide-react";

export interface DeckItem {
  id: number;
  name: string;
  icon: string;
  targetLanguage: VocabularyTargetLanguage;
  vocabularyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyItem {
  id: number;
  text: string;
  meaning?: string;
  partOfSpeech?: string;
  pronunciation?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DeckDetail extends DeckItem {
  vocabularies: VocabularyItem[];
}

export type DeckOption = {
  id: number;
  name: string;
  icon?: string;
};

export type CreateDeckPayload = {
  name: string;
  icon: string;
  targetLanguage: VocabularyTargetLanguage;
};

export type UpdateDeckPayload = {
  name: string;
  icon: string;
};

export type SaveVocabularyToDeckPayload = {
  text: string;
  partOfSpeech?: string;
  meaning?: string;
  pronunciation?: string;
  exampleSentence?: string;
  targetLanguage: VocabularyTargetLanguage;
};

export type DeckPracticeMode = "FLASHCARD" | "MATCH_MEANING" | "TYPE_WORD";

export const DECK_PRACTICE_MODE_LABEL: Record<DeckPracticeMode, string> = {
  FLASHCARD: "Flashcard",
  MATCH_MEANING: "Nối từ với nghĩa",
  TYPE_WORD: "Gõ từ",
};

export const DECK_PRACTICE_ROUTE_MODE: Record<DeckPracticeMode, string> = {
  FLASHCARD: "flashcard",
  MATCH_MEANING: "match-meaning",
  TYPE_WORD: "type-word",
};

export type DeckPracticePageState = {
  deckName?: string;
  targetLanguage?: VocabularyTargetLanguage;
  mode: DeckPracticeMode;
  vocabularies: VocabularyItem[];
};

export const DECK_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "book-open": BookOpen,
  business: BriefcaseBusiness,
  education: GraduationCap,
};

export const LANGUAGE_COUNTRY_CODE: Record<VocabularyTargetLanguage, "US" | "CN" | "KR"> = {
  EN: "US",
  ZH: "CN",
  KO: "KR",
};

export const DECK_HEADER_STYLES = [
  { bg: "#dbe9fb", iconClass: "text-[#2f80ed]" },
  { bg: "#e8f7ee", iconClass: "text-[#27ae60]" },
  { bg: "#fff1df", iconClass: "text-[#f2994a]" },
  { bg: "#efe7ff", iconClass: "text-[#9b51e0]" },
  { bg: "#ffe6ea", iconClass: "text-[#eb5757]" },
  { bg: "#e6f7f7", iconClass: "text-[#00a3a3]" },
] as const;

export const DECK_ICON_OPTIONS = [
  { key: "book-open", label: "Học tập", icon: BookOpen },
  { key: "travel", label: "Du lịch", icon: Plane },
  { key: "food", label: "Ẩm thực", icon: UtensilsCrossed },
  { key: "business", label: "Công việc", icon: BriefcaseBusiness },
  { key: "health", label: "Sức khỏe", icon: HeartPulse },
  { key: "fitness", label: "Thể thao", icon: Dumbbell },
  { key: "culture", label: "Văn hóa", icon: Landmark },
  { key: "technology", label: "Công nghệ", icon: Code2 },
  { key: "music", label: "Âm nhạc", icon: Music2 },
  { key: "movies", label: "Phim ảnh", icon: Film },
  { key: "global", label: "Toàn cầu", icon: Globe2 },
  { key: "education", label: "Giáo dục", icon: GraduationCap },
] as const;

export const createDeckFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nhập tên bộ từ vựng")
    .max(150, "Tên bộ từ vựng tối đa 150 ký tự"),
  icon: z.string().trim().min(1),
});

export type CreateDeckFormValues = z.infer<typeof createDeckFormSchema>;

export const editDeckFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nhập tên bộ từ vựng")
    .max(150, "Tên bộ từ vựng tối đa 150 ký tự"),
  icon: z.string().trim().min(1),
});

export type EditDeckFormValues = z.infer<typeof editDeckFormSchema>;
