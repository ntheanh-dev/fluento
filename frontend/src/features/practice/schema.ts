import { z } from "zod";
import { PRACTICE_TYPES, TOPIC_GROUPS, LEVELS, SENTENCE_COUNTS, TONES } from "./constants";

const practiceTypeValues = [
    ...PRACTICE_TYPES.map((type) => type.value),
    "SINGLE_SENTENCE",
] as unknown as [string, ...string[]];

const toneValues = TONES.map((x) => x.value) as unknown as [string, ...string[]];

const practiceSetupSchema = z.object({
    type: z.enum(practiceTypeValues),
    tone: z.enum(toneValues),
    topic: z.enum(TOPIC_GROUPS.flatMap((group) => group.topics.map((topic) => topic.value))),
    level: z.enum(LEVELS.map((level) => level.value)),
    sentenceCount: z.enum(SENTENCE_COUNTS.map((sentenceCount) => sentenceCount.value)),
});


export type PracticeSetupInput = z.infer<typeof practiceSetupSchema>;

export const answerPreviewInputSchema = z.object({
    translatedSentence: z.string(),
    orderIndex: z.number(),
});


export type AnswerPreviewInput = z.infer<typeof answerPreviewInputSchema>;
export { practiceSetupSchema };


