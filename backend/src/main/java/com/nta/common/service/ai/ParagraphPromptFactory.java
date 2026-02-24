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
}
