package com.nta.service;

import com.nta.dto.request.GenerateParagraphRequest;
import com.nta.dto.request.SentenceTranslationRequest;
import com.nta.dto.response.GenerateParagraphResponse;
import com.nta.dto.response.HintTranslationResponse;
import com.nta.dto.response.SentenceTranslationResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.UUID;

@Service
public class WritingService {
    private final ChatClient chatClient;
    private final AIChatService aiChatService;

    public WritingService(ChatClient chatClient, AIChatService aiChatService) {
        this.chatClient = chatClient;
        this.aiChatService = aiChatService;
    }

//    public List<String> generateParagraph(final GenerateParagraphRequest request) {
//
//        final String paragraphId = UUID.randomUUID().toString();
//
//        final SystemMessage systemMessage = new SystemMessage("""
//                You are a writing assistant that generates paragraphs based on user requests.
//                You should respond with a formal voice and provide well-structured paragraphs.
//                Your responses should be coherent, relevant, and tailored to the user's request.
//                Ensure that each paragraph is well-formed and contains the specified number of sentences.
//                """);
//
//        final String promptText = String.format(
//                "Write a paragraph with %d sentences about '%s' in %s language, with words in level %s.",
//                request.getSentenceCount(),
//                request.getTopic(),
//                request.getLanguage(),
//                request.getLevel()
//        );
//
//        UserMessage userMessage = new UserMessage(promptText);
//        Prompt prompt = new Prompt(systemMessage, userMessage);
//
//        return Objects.requireNonNull(chatClient
//                        .prompt(prompt)
//                        .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, paragraphId))
//                        .call()
//                        .content())
//                .lines()
//                .toList();
//    }

    public GenerateParagraphResponse generateParagraph(final GenerateParagraphRequest request) {

        final String systemMessage = "You are a writing assistant that generates paragraphs based on user requests. You should respond with a formal voice and provide well-structured paragraphs. Your responses should be coherent, relevant, and tailored to the user's request. Ensure that each paragraph is well-formed and contains the specified number of sentences.";

        final String promptText = String.format(
                "Write a paragraph with %d sentences about '%s' in %s language, with words in level %s.",
                request.getSentenceCount(),
                request.getTopic(),
                request.getLanguage(),
                request.getLevel()
        );

        final String conversationId = UUID.randomUUID().toString();

        final String pharagraph = aiChatService.sendMessage(conversationId, systemMessage, promptText, String.class);

        return GenerateParagraphResponse.builder()
                .conversationId(conversationId)
                .paragraphs(Arrays.stream(pharagraph.split("\\.\\s*")).toList())
                .build();
    }

    public HintTranslationResponse generateHints(
            String conversationId,
            String vietnameseSentence
    ) {
        final String SYSTEM_MESSAGE_TEXT =
                "You are an English learning assistant for Vietnamese learners. " +
                        "Return ONLY valid JSON (no prose, no markdown). " +
                        "Use EXACTLY these property names in camelCase:\n" +
                        "{\n" +
                        "  \"vocabularyHints\": [\n" +
                        "    { \"vietnamese\": \"...\", \"english\": [\"...\"] }\n" +
                        "  ],\n" +
                        "  \"structureHints\": {\n" +
                        "    \"kindsOfSentencesAccordingToStructure\": { \"vietnamese\": \"...\", \"english\": \"...\" },\n" +
                        "    \"tenses\": { \"vietnamese\": \"...\", \"english\": \"...\", \"form\": \"...\" }\n" +
                        "  }\n" +
                        "}\n" +
                        "Rules:\n" +
                        "- vocabularyHints: list all Vietnamese phrases mapped to one or more correct English equivalents.\n" +
                        "- structureHints.kindsOfSentencesAccordingToStructure: sentence type in Vietnamese and English (e.g., \"Câu phức\" / \"complex sentence\").\n" +
                        "- structureHints.tenses: tense in Vietnamese and English and its form (e.g., \"Thì hiện tại đơn\" / \"simple present\" / \"S + V + O\").\n" +
                        "- Do not change property names. Do not add or omit properties. " +
                        "If unsure about a value, provide your best estimate.";

        String promptText = String.format(
                "Vietnamese sentence: \"%s\"\n" +
                        "Analyze this sentence and produce JSON EXACTLY with the keys: " +
                        "vocabularyHints, structureHints.kindsOfSentencesAccordingToStructure, structureHints.tenses. " +
                        "The output must be valid JSON and use camelCase keys exactly as specified.",
                vietnameseSentence
        );

        return aiChatService.sendMessage(
                conversationId,
                SYSTEM_MESSAGE_TEXT,
                promptText,
                HintTranslationResponse.class
        );
    }

    public SentenceTranslationResponse translateSentence(final SentenceTranslationRequest request, final String conversationId) {
        final String SYSTEM_MESSAGE_TEXT = """
                You are an assistant helping Vietnamese learners improve English translation.
                
                Instructions:
                1. Evaluate the learner’s English translation of a given Vietnamese sentence.
                2. Respond strictly in valid JSON only, matching the schema below.
                3. If no issues in a category, return an empty array [].
                4. Feedback.strengths and feedback.weaknesses fields must be written in clear Vietnamese.
                5. Do not output anything outside the JSON.
                
                JSON Schema:
                {
                  "originalVietnamese": "string",
                  "learnerEnglish": "string",
                  "corrections": {
                    "spellingMistakes": [
                      { "word": "string", "suggestion": "string" }
                    ],
                    "vocabularyIssues": [
                      { "word": "string", "suggestion": ["string"] }
                    ],
                    "grammarErrors": [
                      { "issue": "string", "example": "wrong → correct" }
                    ],
                    "sentenceStructure": [
                      { "problem": "string", "suggestion": "string" }
                    ]
                  },
                  "feedback": {
                    "strengths": ["string (Vietnamese)"],
                    "weaknesses": ["string (Vietnamese)"]
                  },
                  "improvedTranslation": "string"
                }
                """;

        final String promptText = String.format(
                "Original Vietnamese sentence: %s%nLearner English sentence: %s",
                request.getVietnameseSentence(),
                request.getEnglishSentence()
        );
        return aiChatService.sendMessage(
                conversationId,
                SYSTEM_MESSAGE_TEXT,
                promptText,
                SentenceTranslationResponse.class
        );
    }
}
