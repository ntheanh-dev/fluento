import { z } from "zod";
import type { TargetLanguage } from "@/shared/constants/target-language";
import type { SentenceFeedback } from "@/entities/userPracticeAnswer/schema";
import type { VocabularyHint } from "@/entities/paragraphSentence/schema";
import { PRACTICE_TYPES, TOPIC_GROUPS, LEVELS, SENTENCE_COUNTS, TONES } from "./constants";
import { SINGLE_SENTENCE_MIX_VALUES } from "./constants";

const aiPracticeTypeValues = [
    ...PRACTICE_TYPES.map((type) => type.value),
    "SINGLE_SENTENCE",
] as unknown as [string, ...string[]];

const toneValues = TONES.map((x) => x.value) as unknown as [string, ...string[]];
const topicValues = TOPIC_GROUPS.flatMap((group) =>
    group.topics.map((topic) => topic.value),
) as unknown as [string, ...string[]];
const levelValues = LEVELS.map((level) => level.value) as unknown as [string, ...string[]];
const sentenceCountValues = SENTENCE_COUNTS.map((sentenceCount) => sentenceCount.value) as unknown as [
    string,
    ...string[],
];
const singleSentenceMixValues = [
    "STATEMENT",
    "QUESTION",
    "REQUEST",
    "PAST",
    "PRESENT",
    "FUTURE",
] as const;
const targetLanguageValues = ["EN", "ZH", "KO"] as const;

const aiPracticeSetupSchema = z.object({
    type: z.enum(aiPracticeTypeValues),
    tone: z.enum(toneValues),
    topic: z.enum(topicValues),
    level: z.enum(levelValues),
    sentenceCount: z.enum(sentenceCountValues),
    singleSentenceMix: z.array(z.enum(singleSentenceMixValues)).optional(),
    targetLanguage: z.enum(targetLanguageValues).optional(),
});

const userInputPracticeSetupSchema = z.object({
    type: z.literal("USER_INPUT"),
    tone: z.enum(toneValues),
    topic: z.enum(topicValues),
    level: z.enum(levelValues),
    rawContent: z.string().min(1).max(12_000),
    targetLanguage: z.enum(targetLanguageValues).optional(),
});

const practiceSetupSchema = z.union([userInputPracticeSetupSchema, aiPracticeSetupSchema]);

export type PracticeSetupInput = z.infer<typeof practiceSetupSchema>;

/** Admin / AI paragraph creation only (excludes USER_INPUT). */
export type AiPracticeSetupInput = Extract<PracticeSetupInput, { sentenceCount: string }>;

export const answerPreviewInputSchema = z.object({
    translatedSentence: z.string(),
    orderIndex: z.number(),
});


export type AnswerPreviewInput = z.infer<typeof answerPreviewInputSchema>;
export { practiceSetupSchema };

export type SingleSentenceMixOption = (typeof SINGLE_SENTENCE_MIX_VALUES)[number];
export type RenderAsideType = "hints" | "markdownFeedback" | null;
export type HintsTab = "vocabulary" | "community";

export type PendingVocabulary = {
    text: string;
    partOfSpeech: string;
    pronunciation: string;
    meaning?: string;
};

export type DetailedSuggestionCardProps = {
    feedback: Partial<SentenceFeedback> | null;
    userTranslation?: string;
    isStreaming?: boolean;
    targetLanguage: TargetLanguage;
};

export type AsideProps = {
    isLoadingAnswerPreview: boolean;
    isLoadingVocabularyHints: boolean;
    vocabularyHints: VocabularyHint[] | null;
    hintsSentenceId: number;
    renderAsideType: RenderAsideType;
    feedback: SentenceFeedback | null;
    userTranslation?: string;
    streamingFeedback?: Partial<SentenceFeedback> | null;
    targetLanguage: TargetLanguage;
};


