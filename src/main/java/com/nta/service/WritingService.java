package com.nta.service;

import com.nta.dto.request.GenerateParagraphRequest;
import com.nta.dto.response.GenerateParagraphResponse;
import com.nta.dto.response.HintTranslationResponse;
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
//        final String SYSTEM_MESSAGE_TEXT =
//                "You are an English learning assistant. " +
//                        "Your job is to help Vietnamese learners translate Vietnamese sentences into English. " +
//                        "For each input, you MUST return a JSON object with this structure:\n\n" +
//                        "{\n" +
//                        "  \"vocabularyHints\": [\n" +
//                        "    {\n" +
//                        "      \"vietnamese\": \"...\",\n" +
//                        "      \"english\": [\"...\"]\n" +
//                        "    }, ...\n" +
//                        "  ],\n" +
//                        "  \"structureHints\": {\n" +
//                        "    \"kinds of sentences according to structure\": {\n" +
//                        "      \"vietnamese\": \"...\",\n" +
//                        "      \"english\": \"...\"\n" +
//                        "    },\n" +
//                        "    \"tenses\": {\n" +
//                        "      \"vietnamese\": \"...\",\n" +
//                        "      \"english\": \"...\",\n" +
//                        "      \"form\": \"...\"\n" +
//                        "    }\n" +
//                        "  },\n" +
//                        "  \"sampleTranslation\": \"...\"\n" +
//                        "}\n\n" +
//                        "Rules:\n" +
//                        "- \"vocabularyHints\" = a list of important Vietnamese phrases mapped to one or more correct English translations.\n" +
//                        "- \"structureHints\" = explain grammar (sentence type, tense, form).\n" +
//                        "- \"sampleTranslation\" = one full natural English translation of the input sentence.\n" +
//                        "- Return **ONLY valid JSON**, no extra text.";
//
//        String promptText = String.format(
//                "Vietnamese sentence: \"%s\"\n" +
//                        "Please analyze and output the result strictly in the required JSON format. " +
//                        "Ensure that:\n" +
//                        "- Vocabulary hints contain pairs of Vietnamese phrase and possible English equivalents.\n" +
//                        "- Structure hints identify sentence type and tense (with form).\n" +
//                        "- Provide one full English sample translation.",
//                vietnameseSentence
//        );

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

}
