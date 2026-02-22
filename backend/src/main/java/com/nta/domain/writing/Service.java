package com.nta.domain.writing;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.nta.common.enums.Level;
import com.nta.common.enums.SentenceCount;
import com.nta.common.enums.Tone;
import com.nta.common.enums.Topic;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.ai.ChatService;
import com.nta.domain.user.User;
import com.nta.domain.writing.dto.request.GenerateParagraphRequest;
import com.nta.domain.writing.dto.request.SentenceTranslationRequest;
import com.nta.domain.writing.dto.response.GenerateParagraphResponse;
import com.nta.domain.writing.dto.response.HintTranslationResponse;
import com.nta.domain.writing.dto.response.SentenceTranslationResponse;
import com.nta.domain.writing.dto.response.WritingResponse;

import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@org.springframework.stereotype.Service("writingService")
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
public class Service {
    ChatService chatService;
    Repository repository;
    Mapper mapper;
    private final CommonUserService commonUserService;

    public Service(
            ChatService chatService,
            com.nta.domain.user.Service userService,
            Repository repository,
            Mapper mapper,
            CommonUserService commonUserService) {
        this.chatService = chatService;
        this.repository = repository;
        this.mapper = mapper;
        this.commonUserService = commonUserService;
    }

    public GenerateParagraphResponse generateParagraph(final GenerateParagraphRequest request) {

        final String conversationId = UUID.randomUUID().toString();
        final String pharagraph;

        // Check if this is a custom text request
        final boolean isCustomText = request.getCustomText() != null
                && !request.getCustomText().trim().isEmpty();

        if (isCustomText) {
            // Custom text mode - use the text directly without AI processing
            pharagraph = request.getCustomText().trim();
        } else {
            // Original mode - generate new content using AI
            final String systemMessage =
                    "You are an expert language learning assistant specializing in creating educational content for Vietnamese learners studying English. "
                            + "Your task is to generate well-structured, coherent paragraphs that help learners practice reading and translation skills. "
                            + "Always ensure the content is culturally appropriate, engaging, and educational. "
                            + "The paragraphs should flow naturally and contain vocabulary appropriate for the specified language proficiency level.";

            final String promptText = String.format(
                    "Create a well-structured paragraph in %s with around %d sentences about the topic '%s'. "
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
                            + "Topic: %s\nLanguage: %s\nLevel: %s\nTone: %s\nSentences: %d",
                    request.getLanguage(),
                    request.getSentenceCount(),
                    request.getTopic(),
                    request.getLevel(),
                    request.getTone(),
                    request.getTopic(),
                    request.getLanguage(),
                    request.getLevel(),
                    request.getTone(),
                    request.getSentenceCount());

            pharagraph = chatService
                    .sendMessage(systemMessage, promptText, String.class)
                    .getResult();
        }

        final User user = commonUserService.getUserFromContext();

        final Topic topic = isCustomText ? null : Topic.fromString(request.getTopic());
        final Level level = isCustomText ? null : Level.fromString(request.getLevel());
        final SentenceCount sentenceCount = isCustomText
                ? null
                : SentenceCount.fromSize(request.getSentenceCount() != null ? request.getSentenceCount() : 10);
        final Tone tone = isCustomText ? null : Tone.fromString(request.getTone());

        // Determine writing type: use provided type, or default based on customText flag
        WritingType writingType;
        if (request.getWritingType() != null && !request.getWritingType().isBlank()) {
            writingType = WritingType.fromString(request.getWritingType());
            if (writingType == null) {
                // Invalid type provided, default to BASIC
                writingType = WritingType.BASIC;
            }
        } else {
            // Default behavior: CUSTOM_TEXT if customText provided, otherwise AI_GENERATED
            writingType = isCustomText ? WritingType.CUSTOM_TEXT : WritingType.AI_GENERATED;
        }

        final Writing writing = Writing.builder()
                .conversationId(conversationId)
                .type(writingType)
                .topic(topic)
                .level(level)
                .user(user)
                .sentenceCount(sentenceCount)
                .tone(tone)
                .vietnameseParagraph(pharagraph)
                .customText(isCustomText ? request.getCustomText().trim() : null)
                .createdAt(LocalDateTime.now())
                .build();

        repository.save(writing);
        log.info("Paragraph generated - conversationId: {}, type: {}", conversationId, writingType);

        return GenerateParagraphResponse.builder()
                .conversationId(conversationId)
                .paragraphs(Arrays.stream(pharagraph.split("\\.\\s*")).toList())
                .build();
    }

    public HintTranslationResponse generateHints(final String vietnameseSentence, final String level) {
        final String SYSTEM_MESSAGE_TEXT =
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
                        + "    { \"vietnamese\": \"word/phrase\", \"english\": [\"translation1\", \"translation2\"] }\n"
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

        String promptText = String.format(
                "Analyze the Vietnamese sentence below and provide comprehensive learning hints in the specified JSON format for %s level proficiency.\n\n"
                        + "Vietnamese sentence: \"%s\"\n\n"
                        + "Tasks:\n"
                        + "1. Extract key vocabulary with appropriate English translations suitable for %s level\n"
                        + "2. Identify the sentence structure type in both languages\n"
                        + "3. Determine the main tense/aspect with grammatical pattern\n"
                        + "4. Ensure all hints support effective Vietnamese-to-English translation learning at %s level\n\n"
                        + "Return only the JSON response with exact property names as specified.",
                level, vietnameseSentence, level, level);

        return chatService
                .sendMessage(SYSTEM_MESSAGE_TEXT, promptText, HintTranslationResponse.class)
                .getResult();
    }

    public SentenceTranslationResponse translateSentence(
            final SentenceTranslationRequest request, final String conversationId) {
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
					{ "issue": "specific grammar problem in Vietnamese", "example": "incorrect form → correct form" }
					],
					"sentenceStructure": [
					{ "problem": "structural issue description in Vietnamese", "suggestion": "how to improve structure in Vietnamese" }
					]
				},
				"feedback": {
					"weaknesses": ["areas for improvement in Vietnamese"]
				},
				"improvedTranslation": "polished, natural English translation",
				"score": "number (1-10 scale)"
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
                request.getVietnameseSentence(), request.getEnglishSentence());

        return chatService
                .sendMessage(SYSTEM_MESSAGE_TEXT, promptText, SentenceTranslationResponse.class)
                .getResult();
    }

    public WritingResponse getConversationById(String conversationId) {
        final Writing writing =
                repository.findByConversationIdWithSentences(conversationId).orElse(null);
        final WritingResponse response = mapper.toWritingResponse(writing);
        List<String> vietNamesesentences =
                List.of(writing.getVietnameseParagraph().split("(?<=[.!?])\\s+"));

        if (response.getType() != WritingType.AI_GENERATED && vietNamesesentences.size() > 0) {
            response.setSentenceCount(SentenceCount.fromSize(vietNamesesentences.size()));
        }
        response.setVietNamesesentences(vietNamesesentences);
        return response;
    }

    public Page<WritingResponse> getAllWritings(
            final int page,
            final int size,
            final String direction,
            final String sortBy,
            final String keyword,
            final Long userId) {

        final Sort sort = "desc".equalsIgnoreCase(direction)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        final Pageable pageable = PageRequest.of(page, size, sort);

        final Page<Writing> writingsPage = keyword == null || keyword.isEmpty()
                ? repository.findByUserId(userId, pageable)
                : repository.searchByTopicNameAndUserId(keyword, userId, pageable);

        return writingsPage.map(this::toResponse);
    }

    private WritingResponse toResponse(Writing writing) {
        WritingResponse response = mapper.toWritingResponse(writing);

        // Split paragraphs into sentences
        if (writing.getVietnameseParagraph() != null) {
            response.setVietNamesesentences(
                    List.of(writing.getVietnameseParagraph().split("(?<=[.!?])\\s+")));
        } else {
            response.setVietNamesesentences(List.of());
        }

        return response;
    }
}
