package com.nta.service;

import com.nta.dto.request.GenerateParagraphRequest;
import com.nta.dto.request.SentenceTranslationRequest;
import com.nta.dto.response.GenerateParagraphResponse;
import com.nta.dto.response.HintTranslationResponse;
import com.nta.dto.response.SentenceTranslationResponse;
import com.nta.dto.response.WritingResponse;
import com.nta.entity.Writing;
import com.nta.mapper.WritingMapper;
import com.nta.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Service
@FieldDefaults(makeFinal = true, level = lombok.AccessLevel.PRIVATE)
@RequiredArgsConstructor
public class WritingService {
    ChatClient chatClient;
    AIChatService aiChatService;
    ChatMemoryRepository chatMemoryRepository;

    TopicRepository topicRepository;
    LevelRepository levelRepository;
    SentenceCountRepository sentenceCountRepository;
    ToneRepository toneRepository;
    WritingRepository writingRepository;

    WritingMapper writingMapper;

    public GenerateParagraphResponse generateParagraph(final GenerateParagraphRequest request) {

        final String systemMessage =
                "You are an expert language learning assistant specializing in creating educational content for Vietnamese learners studying English. " +
                "Your task is to generate well-structured, coherent paragraphs that help learners practice reading and translation skills. " +
                "Always ensure the content is culturally appropriate, engaging, and educational. " +
                "The paragraphs should flow naturally and contain vocabulary appropriate for the specified language proficiency level.";

        final String promptText =
                String.format(
                        "Create a well-structured paragraph in %s with exactly %d sentences about the topic '%s'. " +
                        "Requirements:\n" +
                        "- Use vocabulary and grammar appropriate for %s proficiency level\n" +
                        "- Maintain a %s tone throughout the text\n" +
                        "- Ensure sentences are connected logically with appropriate transitions\n" +
                        "- Make the content engaging and educational for Vietnamese learners\n" +
                        "- Focus on practical, real-world applications of the topic\n" +
                        "- Use varied sentence structures to enhance learning value\n\n" +
                        "Topic: %s\nLanguage: %s\nLevel: %s\nTone: %s\nSentences: %d",
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

        final String conversationId = UUID.randomUUID().toString();

        final String pharagraph =
                aiChatService.sendMessage(conversationId, systemMessage, promptText, String.class);

        // TODO add User to Writing
        final Writing writing =
                Writing.builder()
                        .conversationId(conversationId)
                        .topic(topicRepository.findByName(request.getTopic()).orElse(null))
                        .level(levelRepository.findByName(request.getLevel()).orElse(null))
                        .sentenceCount(
                                sentenceCountRepository
                                        .findBySize(request.getSentenceCount())
                                        .orElse(null))
                        .tone(toneRepository.findByName(request.getTone()).orElse(null))
                        .vietnameseParagraph(pharagraph)
                        .createdAt(LocalDateTime.now())
                        .build();

        writingRepository.save(writing);

        return GenerateParagraphResponse.builder()
                .conversationId(conversationId)
                .paragraphs(Arrays.stream(pharagraph.split("\\.\\s*")).toList())
                .build();
    }

    public HintTranslationResponse generateHints(String conversationId, String vietnameseSentence) {
        final String SYSTEM_MESSAGE_TEXT =
                "You are an expert English learning assistant specializing in helping Vietnamese learners understand sentence structure and vocabulary. " +
                "Your role is to provide comprehensive, educational hints that help learners translate Vietnamese sentences to English effectively. " +
                "You must return ONLY valid JSON with no additional text, markdown, or explanations outside the JSON structure. " +
                "Be precise, educational, and focus on practical learning insights.\n\n" +
                "JSON Schema (use EXACTLY these property names in camelCase):\n" +
                "{\n" +
                "  \"vocabularyHints\": [\n" +
                "    { \"vietnamese\": \"word/phrase\", \"english\": [\"translation1\", \"translation2\"] }\n" +
                "  ],\n" +
                "  \"structureHints\": {\n" +
                "    \"kindsOfSentencesAccordingToStructure\": { \"vietnamese\": \"loại câu\", \"english\": \"sentence type\" },\n" +
                "    \"tenses\": { \"vietnamese\": \"thì trong tiếng Việt\", \"english\": \"English tense\", \"form\": \"grammar pattern\" }\n" +
                "  }\n" +
                "}\n\n" +
                "Detailed Requirements:\n" +
                "- vocabularyHints: Extract ALL key words/phrases with their most appropriate English translations. Include multiple translations when relevant.\n" +
                "- kindsOfSentencesAccordingToStructure: Identify sentence type (simple/compound/complex) in both languages with proper Vietnamese terminology.\n" +
                "- tenses: Identify the main tense/aspect with Vietnamese name, English equivalent, and grammatical pattern (e.g., 'S + V + O', 'S + have/has + V3').\n" +
                "- Provide educational value by choosing translations that help learners understand context and usage.\n" +
                "- Maintain JSON validity - no trailing commas, proper escaping, exact property names.";

        String promptText =
                String.format(
                        "Analyze the Vietnamese sentence below and provide comprehensive learning hints in the specified JSON format.\n\n" +
                        "Vietnamese sentence: \"%s\"\n\n" +
                        "Tasks:\n" +
                        "1. Extract key vocabulary with appropriate English translations\n" +
                        "2. Identify the sentence structure type in both languages\n" +
                        "3. Determine the main tense/aspect with grammatical pattern\n" +
                        "4. Ensure all hints support effective Vietnamese-to-English translation learning\n\n" +
                        "Return only the JSON response with exact property names as specified.",
                        vietnameseSentence);

        return aiChatService.sendMessage(
                conversationId, SYSTEM_MESSAGE_TEXT, promptText, HintTranslationResponse.class);
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
                      { "issue": "specific grammar problem", "example": "incorrect form → correct form" }
                    ],
                    "sentenceStructure": [
                      { "problem": "structural issue description", "suggestion": "how to improve structure" }
                    ]
                  },
                  "feedback": {
                    "strengths": ["positive aspects in Vietnamese (use Vietnamese for explanations, keep English words/phrases as examples)"],
                    "weaknesses": ["areas for improvement in Vietnamese (use Vietnamese for explanations, keep English words/phrases as examples)"]
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
                
                Scoring System (1-10 scale):
                - 9-10: Excellent translation with minimal errors, natural English flow
                - 7-8: Good translation with minor issues, mostly accurate
                - 5-6: Adequate translation with some errors but understandable
                - 3-4: Poor translation with significant errors affecting comprehension
                - 1-2: Very poor translation with major errors and poor understanding
                
                Feedback Guidelines:
                - Strengths: Acknowledge correct usage, good word choices, proper grammar in Vietnamese
                - Weaknesses: Identify specific areas needing improvement with gentle, educational tone in Vietnamese
                - Use Vietnamese for all explanations and comments to be user-friendly
                - Keep English words/phrases only as examples when necessary
                - Make feedback warm and encouraging while being constructive
                - Score: Provide fair assessment based on overall quality and error frequency
                """;

        final String promptText =
                String.format(
                        """
                        Please evaluate the following Vietnamese-to-English translation attempt:
                        
                        Original Vietnamese: "%s"
                        Learner's English Translation: "%s"
                        
                        Analysis Tasks:
                        1. Compare the learner's translation with the original Vietnamese meaning
                        2. Identify any spelling errors and provide corrections
                        3. Evaluate vocabulary choices and suggest improvements where needed
                        4. Check grammar accuracy and highlight specific errors with examples
                        5. Assess sentence structure and suggest improvements for natural English flow
                        6. Provide encouraging feedback highlighting what the learner did well (in Vietnamese)
                        7. Identify specific areas for improvement with constructive guidance (in Vietnamese)
                        8. Create an improved version that maintains the original meaning while sounding natural in English
                        9. Assign a score from 1-10 based on overall translation quality
                        
                        Return your analysis in the specified JSON format with detailed, educational feedback including score.
                        """,
                        request.getVietnameseSentence(), request.getEnglishSentence());
        return aiChatService.sendMessage(
                conversationId, SYSTEM_MESSAGE_TEXT, promptText, SentenceTranslationResponse.class);
    }

    public WritingResponse getConversationById(String conversationId) {
        final Writing writing = writingRepository.findByConversationId(conversationId);
        final WritingResponse response = writingMapper.toWritingResponse(writing);

        response.setSentences(List.of(writing.getVietnameseParagraph().split("(?<=[.!?])\\s+")));
        if (writing.getTranslatedParagraph() == null) {
            response.setEnglishTranslations(List.of());
        } else {
            response.setEnglishTranslations(
                    List.of(writing.getTranslatedParagraph().split("(?<=[.!?])\\s+")));
        }
        return response;
    }

    public void write(final String conversationId, String englishSentence) {
        final Writing writing = writingRepository.findByConversationId(conversationId);

        if (!englishSentence.endsWith("(?<=[.!?])\\s+")) {
            englishSentence += ".";
        }

        if (writing.getTranslatedParagraph() == null
                || writing.getTranslatedParagraph().isEmpty()) {
            writing.setTranslatedParagraph(englishSentence);
        } else {
            writing.setTranslatedParagraph(
                    writing.getTranslatedParagraph() + " " + englishSentence);
        }

        writing.setUpdatedAt(LocalDateTime.now());
        writingRepository.save(writing);
    }

    public Page<WritingResponse> getAllWritings(
            final int page,
            final int size,
            final String direction,
            final String sortBy,
            final String keyword) {

        final Sort sort =
                "desc".equalsIgnoreCase(direction)
                        ? Sort.by(sortBy).descending()
                        : Sort.by(sortBy).ascending();

        final Pageable pageable = PageRequest.of(page, size, sort);

        final Page<Writing> writingsPage =
                keyword == null || keyword.isEmpty()
                        ? writingRepository.findAll(pageable)
                        : writingRepository.searchByTopicName(keyword, pageable);

        return writingsPage.map(this::toResponse);
    }

    private WritingResponse toResponse(Writing writing) {
        WritingResponse response = new WritingResponse();

        response.setId(writing.getId());
        response.setConversationId(writing.getConversationId());
        response.setUser(writing.getUser());
        response.setTopic(writing.getTopic());
        response.setLevel(writing.getLevel());
        response.setTone(writing.getTone());
        response.setSentenceCount(writing.getSentenceCount());
        response.setCreatedAt(writing.getCreatedAt());
        response.setUpdatedAt(writing.getUpdatedAt());

        // Split paragraphs into sentences
        if (writing.getVietnameseParagraph() != null) {
            response.setSentences(
                    List.of(writing.getVietnameseParagraph().split("(?<=[.!?])\\s+")));
        } else {
            response.setSentences(List.of());
        }

        if (writing.getTranslatedParagraph() != null) {
            response.setEnglishTranslations(
                    List.of(writing.getTranslatedParagraph().split("(?<=[.!?])\\s+")));
        } else {
            response.setEnglishTranslations(List.of());
        }

        return response;
    }
}
