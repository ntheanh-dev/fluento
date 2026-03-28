package com.nta.common.service.ai.impl;

import java.util.List;
import java.util.Objects;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nta.common.service.ai.ChatResponse;
import com.nta.common.service.ai.ChatService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Primary
public class CloudFlareChatService implements ChatService {

    private final ObjectMapper objectMapper;

    @Override
    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {
        String outputText = doChatCall(systemMessage, userMessage);
        T result = parseResponse(outputText, responseType);
        return ChatResponse.<T>builder()
                .result(result)
                .promptTokens(0)
                .completionTokens(0)
                .totalTokens(0)
                .build();
    }

    private <T> T parseResponse(String outputText, Class<T> responseType) {

        if (responseType == String.class) {
            return responseType.cast(outputText.trim());
        }

        try {

            ChatCompletionResponse outer = objectMapper.readValue(outputText, ChatCompletionResponse.class);

            log.info(
                    "AI call success - total tokens={} prompt tokens={} completion tokens={}",
                    outer.usage().total_tokens(),
                    outer.usage().prompt_tokens(),
                    outer.usage().completion_tokens());

            String content = outer.choices().getFirst().message().content();

            String cleanJson = extractJson(content);

            return objectMapper.readValue(cleanJson, responseType);
        } catch (Exception e) {
            log.error(
                    "Failed to parse AI response into {}. Output was: {}", responseType.getSimpleName(), outputText, e);
            throw new RuntimeException("Failed to parse AI response", e);
        }
    }

    private ChatClient getOrCreateClient() {

        OpenAiApi openAiApi = OpenAiApi.builder()
                .apiKey("12345")
                .baseUrl("https://fluento.anhthenguyen-work.workers.dev/")
                .build();

        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(OpenAiChatOptions.builder().build())
                .build();

        return ChatClient.builder(chatModel).build();
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
    }

    /**
     * Gọi Gemini với một ApiKey, trả về raw output text. Ném exception nếu lỗi.
     */
    private String doChatCall(String systemMessage, String userMessage) {

        ChatClient client = getOrCreateClient();
        try {
            return Objects.requireNonNull(client.prompt(buildPrompt(systemMessage, userMessage))
                            .call()
                            .chatResponse())
                    .getResult()
                    .getOutput()
                    .getText();
        } catch (Exception e) {
            log.error("AI call failed", e);
            throw new RuntimeException("AI call failed", e);
        }
    }

    private String extractJson(String raw) {
        if (raw == null) return null;

        // remove ```json ... ```
        raw = raw.trim();
        if (raw.startsWith("```")) {
            raw = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        }

        return raw;
    }
}

record ChatCompletionResponse(
        String id, String object, long created, String model, List<Choice> choices, Usage usage) {}

record Choice(Message message) {
    record Message(String content) {}
}

record Usage(int prompt_tokens, int completion_tokens, int total_tokens) {}
