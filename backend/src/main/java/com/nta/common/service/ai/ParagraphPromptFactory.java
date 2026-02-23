package com.nta.common.service.ai;

import org.springframework.stereotype.Component;

import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;

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
                """
				You are a professional English writing assistant.
				Generate a high-quality email.
				Follow the requested tone and sentence count strictly.
				Do not include explanations.
				""";

        String user = """
				Write an email about %s.
				Tone: %s
				Level: %s
				Sentence count: %s
				"""
                .formatted(
                        request.getTopic(),
                        request.getTone(),
                        request.getLevel(),
                        request.getSentenceCount() != null
                                ? request.getSentenceCount().getSize()
                                : "default");

        return new PromptMessage(system, user);
    }

    private PromptMessage buildWritingPrompt(CreateParagraphRequest request) {

        String system =
                """
				You are a professional English writing assistant.
				Generate a high-quality %s.
				Target level: %s.
				Follow the requested tone and, if provided, sentence count strictly.
				Do not include explanations.
				"""
                        .formatted(request.getType().getDisplayName(), request.getLevel());

        String user = """
				Topic: %s
				Tone: %s
				Sentence count: %s
				"""
                .formatted(
                        request.getTopic(),
                        request.getTone(),
                        request.getSentenceCount() != null
                                ? request.getSentenceCount().getSize()
                                : "default");

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
