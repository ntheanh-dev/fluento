import { z } from "zod";
import { PRACTICE_TYPES, TOPIC_GROUPS, LEVELS, TONES, SENTENCE_COUNTS } from "./constants";

const practiceSetupSchema = z.object({
    type: z.enum(PRACTICE_TYPES.map((type) => type.value)),
    topic: z.enum(TOPIC_GROUPS.flatMap((group) => group.topics.map((topic) => topic.value))),
    level: z.enum(LEVELS.map((level) => level.value)),
    tone: z.enum(TONES.flatMap((tone) => tone.value)),
    sentenceCount: z.enum(SENTENCE_COUNTS.map((sentenceCount) => sentenceCount.value)),
    customText: z.string().optional(),
});


export type PracticeSetupInput = z.infer<typeof practiceSetupSchema>;

export const answerPreviewInputSchema = z.object({
    translatedSentence: z.string(),
    orderIndex: z.number(),
});


export type AnswerPreviewInput = z.infer<typeof answerPreviewInputSchema>;
export { practiceSetupSchema };


