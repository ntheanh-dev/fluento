package com.nta.common.service.ai;

import org.springframework.stereotype.Component;

import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.SentenceCount;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class ParagraphPromptFactory {

    public PromptMessage buildPrompt(CreateParagraphRequest request) {

        return switch (request.getType()) {
            case BASIC -> buildBasicPrompt(request);

            case STORY, EMAIL, IELTS_TASK1, IELTS_TASK2 -> buildWritingPrompt(request);

            case CUSTOM_TEXT -> buildCustomPrompt(request);
        };
    }

    private PromptMessage buildBasicPrompt(CreateParagraphRequest request) {

        String system =
                "You are an expert language learning assistant specializing in creating educational content for Vietnamese learners studying English. "
                        + "Your task is to generate well-structured, coherent paragraphs that help learners practice reading and translation skills. "
                        + "Always ensure the content is culturally appropriate, engaging, and educational. "
                        + "The paragraphs should flow naturally and contain vocabulary appropriate for the specified language proficiency level.";

        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();

        String user = String.format(
                "Create a well-structured paragraph in vietnamese with around %d sentences about the topic '%s'. "
                        + "Requirements:\n"
                        + "- Use vocabulary and grammar appropriate for %s proficiency level\n"
                        + "- Maintain a %s tone throughout the text\n"
                        + "- Ensure sentences are connected logically with appropriate transitions\n"
                        + "- Make the content engaging and educational for Vietnamese learners\n"
                        + "- Focus on practical, real-world applications of the topic\n"
                        + "- Output ONLY the paragraph content.\n"
                        + "- Do NOT include any introduction, explanation, or extra commentary.\n"
                        + "- Return plain text only.\n"
                        + "- Use varied sentence structures to enhance learning value\n\n"
                        + "Topic: %s\nLanguage: vietnamese\nLevel: %s\nTone: %s\nSentences: %d",
                sentenceCount,
                request.getTopic(),
                request.getLevel(),
                request.getTone(),
                request.getTopic(),
                request.getLevel(),
                request.getTone(),
                sentenceCount);

        return new PromptMessage(system, user);
    }

    private PromptMessage buildWritingPrompt(CreateParagraphRequest request) {
        String system = "You are an expert English-learning content creator. "
                + "Your task is to generate Vietnamese content specifically designed "
                + "for learners to translate into English. "
                + "The content must include sentence structures, grammar patterns, "
                + "and vocabulary that are useful for English translation practice. "
                + "The difficulty must match the specified proficiency level. "
                + "Generate a suitable title and matching content. "
                + "Return ONLY valid JSON with this schema: "
                + "{\"title\":\"string\",\"content\":\"string\"}";

        int sentenceCount =
                request.getSentenceCount() != null ? request.getSentenceCount().getSize() : SentenceCount.TEN.getSize();

        String typeInstruction =
                switch (request.getType()) {
                    case EMAIL -> """
						Write in proper email format:
						- Include greeting
						- Clear body paragraphs
						- Proper closing
						- Semi-formal or formal tone depending on topic
						""";

                    case STORY -> """
						Write as a short story:
						- Clear beginning, middle, and ending
						- Include characters and events
						- Natural narrative flow
						""";

                    case IELTS_TASK1 -> """
						Write in IELTS Task 1 style:
						- Clear introduction
						- Body paragraphs with arguments/examples
						- Logical conclusion
						- Academic tone
						""";
                    case IELTS_TASK2 -> """
							Write in IELTS Task 2 style:
							- Clear introduction
							- Body paragraphs with arguments/examples
							- Logical conclusion
							- Academic tone
							""";

                    default -> """
						Write as a coherent structured paragraph
						with logical flow and transitions.
						""";
                };

        String user = String.format(
                """
					Create a %s in Vietnamese for English translation practice.

					Topic: %s
					Level: %s
					Tone: %s
					Sentences: around %d

					Type-specific Requirements:
					%s

					Translation Practice Requirements:
					- Designed for learners to translate into English.
					- Use practical and real-life context.
					- Include useful grammar patterns for English.
					- Avoid idioms or culturally specific expressions that are hard to translate.
					- Use varied sentence structures.
					- Keep difficulty appropriate for %s level.

					Title Requirements:
					- 5–12 words
					- Specific and clearly related to the content
					""",
                request.getType().getDisplayName(),
                request.getTopic(),
                request.getLevel(),
                request.getTone(),
                sentenceCount,
                typeInstruction,
                request.getLevel());

        return new PromptMessage(system, user);
    }

    private PromptMessage buildCustomPrompt(CreateParagraphRequest request) {

        String system = """
				You are a language detector.
				Answer ONLY "YES" or "NO".
				""";

        String user = """
				Is the following text written in English?

				Text:
				%s
				"""
                .formatted(request.getCustomText());

        return new PromptMessage(system, user);
    }

    public PromptMessage buildHintTranslationPrompt(String sentence, String level) {
        final String system =
                "You are an expert English learning assistant specializing in helping Vietnamese learners understand sentence structure and vocabulary. "
                        + "Your role is to provide comprehensive, educational hints that help learners translate Vietnamese sentences to English effectively. "
                        + "You must return ONLY valid JSON with no additional text, markdown, or explanations outside the JSON structure. "
                        + "Be precise, educational, and focus on practical learning insights.\n\n"
                        + "IMPORTANT: Generate vocabulary hints appropriate for " + level + " level proficiency. "
                        + "Choose English translations that match the vocabulary complexity expected at " + level
                        + " level:\n"
                        + "- A2: Basic vocabulary, simple words and common expressions\n"
                        + "- B1: Intermediate vocabulary, familiar topics and everyday situations\n"
                        + "- B2: Upper-intermediate vocabulary, abstract concepts and complex ideas\n"
                        + "- C1: Advanced vocabulary, sophisticated language and nuanced expressions\n"
                        + "- C2: Proficient vocabulary, complex academic and professional terms\n\n"
                        + "JSON Schema (use EXACTLY these property names in camelCase):\n"
                        + "{\n"
                        + "  \"vocabularyHints\": [\n"
                        + "    { \"vietnamese\": \"word/phrase\", \"english\": [{\"english\": \"translation1\", \"partsOfSpeech\": \"part of speech\", \"ipaPronunciation\": \"ipa pronunciation\"}, {\"english\": \"translation2\", \"partsOfSpeech\": \"part of speech\", \"ipaPronunciation\": \"ipa pronunciation\"}] }\n"
                        + "  ],\n"
                        + "  \"structureHints\": {\n"
                        + "    \"kindsOfSentencesAccordingToStructure\": { \"vietnamese\": \"loại câu\", \"english\": \"sentence type\" },\n"
                        + "    \"tenses\": { \"vietnamese\": \"thì trong tiếng Việt\", \"english\": \"English tense\", \"form\": \"grammar pattern\" }\n"
                        + "  }\n"
                        + "}\n\n"
                        + "Detailed Requirements:\n"
                        + "- vocabularyHints: Extract ALL key words/phrases with their most appropriate English translations for "
                        + level + " level. Include multiple translations when relevant.\n"
                        + "- kindsOfSentencesAccordingToStructure: Identify sentence type (simple/compound/complex) in both languages with proper Vietnamese terminology.\n"
                        + "- tenses: Identify the main tense/aspect with Vietnamese name, English equivalent, and grammatical pattern (e.g., 'S + V + O', 'S + have/has + V3').\n"
                        + "- Provide educational value by choosing translations that help learners understand context and usage appropriate for "
                        + level + " level.\n"
                        + "- Maintain JSON validity - no trailing commas, proper escaping, exact property names.";

        String user = String.format(
                "Analyze the Vietnamese sentence below and provide comprehensive learning hints in the specified JSON format for %s level proficiency.\n\n"
                        + "Vietnamese sentence: \"%s\"\n\n"
                        + "Tasks:\n"
                        + "1. Extract key vocabulary with appropriate English translations suitable for %s level\n"
                        + "2. Identify the sentence structure type in both languages\n"
                        + "3. Determine the main tense/aspect with grammatical pattern\n"
                        + "4. Ensure all hints support effective Vietnamese-to-English translation learning at %s level\n\n"
                        + "Return only the JSON response with exact property names as specified.",
                level, sentence, level, level);

        return new PromptMessage(system, user);
    }

    public PromptMessage buildFeedbackTranslationPrompt(String vietnamese, String translate) {
        final String SYSTEM_MESSAGE_TEXT =
                """
				You are an expert English language instructor specializing in helping Vietnamese learners improve their translation skills.
				Your role is to provide comprehensive, constructive feedback that helps learners understand their mistakes and improve their English proficiency.

				Core Principles:
				- Be encouraging and supportive while being thorough in corrections
				- Focus on educational value and practical learning outcomes
				- Provide specific, actionable feedback that learners can apply immediately
				- Consider Vietnamese language patterns that may influence translation choices
				- Recognize cultural and linguistic differences between Vietnamese and English

				Response Format: Return ONLY valid JSON with no additional text or markdown.

				JSON Schema (use exact property names):
				{
				"originalVietnamese": "string",
				"learnerEnglish": "string",
				"corrections": {
					"spellingMistakes": [
					{ "word": "incorrect spelling", "suggestion": "correct spelling" }
					],
					"vocabularyIssues": [
					{ "word": "problematic word/phrase", "suggestion": ["better option 1", "better option 2"] }
					],
					"grammarErrors": [
					{ "issue": "specific grammar problem in Vietnamese", "suggestion": "incorrect form → correct form" }
					],
					"sentenceStructure": [
					{ "problem": "structural issue description in Vietnamese", "suggestion": "how to improve structure in Vietnamese" }
					]
				},
				"feedback": {
					"weaknesses": ["areas for improvement in Vietnamese as short phrases"]
				},
				"improvedTranslation": "polished, natural English translation",
				"score": "number (1.0-10.0 scale)"
				}

				Evaluation Criteria:
				- Spelling: Check for typos and incorrect word forms
				- Vocabulary: Assess word choice, collocation, and appropriateness
				- Grammar: Review tense usage, subject-verb agreement, article usage, prepositions
				- Structure: Evaluate sentence flow, word order, and natural English patterns
				- Overall fluency: Consider how natural and idiomatic the translation sounds

				Corrections Language Requirements:
				- grammarErrors.issue: Describe the grammar problem in Vietnamese (e.g., "Sử dụng sai giới từ")
				- grammarErrors.example: Show correction in format "wrong → correct" (English examples)
				- sentenceStructure.problem: Describe structural issue in Vietnamese (e.g., "Câu hơi cứng nhắc và có thể cải thiện")
				- sentenceStructure.suggestion: Provide improvement suggestion in Vietnamese (e.g., "Viết lại để có luồng tiếng Anh tự nhiên hơn")

				Scoring System (1-10 scale):
				- 9-10: Excellent translation with minimal errors, natural English flow
				- 7-8: Good translation with minor issues, mostly accurate
				- 5-6: Adequate translation with some errors but understandable
				- 3-4: Poor translation with significant errors affecting comprehension
				- 1-2: Very poor translation with major errors and poor understanding

				Feedback Guidelines:
				- Weaknesses: Identify specific areas needing improvement with gentle, educational tone in Vietnamese
				- Use Vietnamese for all explanations and comments to be user-friendly
				- Keep English words/phrases only as examples when necessary
				- Make feedback warm and encouraging while being constructive
				- Score: Provide fair assessment based on overall quality and error frequency
				""";

        final String promptText = String.format(
                """
						Please evaluate the following Vietnamese-to-English translation attempt:

						Original Vietnamese: "%s"
						Learner's English Translation: "%s"

						Analysis Tasks:
						1. Compare the learner's translation with the original Vietnamese meaning
						2. Identify any spelling errors and provide corrections
						3. Evaluate vocabulary choices and suggest improvements where needed
						4. Check grammar accuracy and highlight specific errors with examples (describe issues in Vietnamese, show corrections in English)
						5. Assess sentence structure and suggest improvements for natural English flow (describe problems in Vietnamese, show corrections in English)
						6. Provide encouraging feedback highlighting what the learner did well (write in Vietnamese, use English only for specific word/phrase examples)
						7. Identify specific areas for improvement with constructive guidance (write in Vietnamese, use English only for specific word/phrase examples)
						8. Create an improved version that maintains the original meaning while sounding natural in English
						9. Assign a score from 1-10 based on overall translation quality

						LANGUAGE GUIDELINES:
						- Corrections descriptions: Use Vietnamese (e.g., "Sử dụng sai giới từ", "Câu hơi cứng nhắc")
						- Correction examples: Use English format "wrong → correct"
						- Feedback: Use Vietnamese explanations with English word/phrase examples in quotes

						Return your analysis in the specified JSON format with detailed, educational feedback including score.
						""",
                vietnamese, translate);
        return new PromptMessage(SYSTEM_MESSAGE_TEXT, promptText);
    }
}
