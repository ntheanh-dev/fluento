package com.nta.common.service.ai.impl;

import java.time.Duration;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.metadata.ChatResponseMetadata;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.nta.common.constant.ChatCacheConstants;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.TokenUtils;
import com.nta.common.service.ai.ChatResponse;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ClientKey;
import com.nta.domain.apikey.ApiKey;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiChatService implements ChatService {

    private final CommonUserService commonUserService;
    private final ObjectMapper objectMapper;
    private final com.nta.domain.apikey.Service apiKeyService;
    private final com.nta.common.service.ApiKeyCrypto apiKeyCrypto;
    private final Cache<String, OpenAiApi> apiCache = Caffeine.newBuilder()
            .maximumSize(ChatCacheConstants.API_CACHE_MAX_SIZE)
            .expireAfterAccess(Duration.ofMinutes(ChatCacheConstants.CACHE_EXPIRE_AFTER_ACCESS_MINUTES))
            .build();

    private final Cache<ClientKey, ChatClient> clientCache = Caffeine.newBuilder()
            .maximumSize(ChatCacheConstants.CLIENT_CACHE_MAX_SIZE)
            .expireAfterAccess(Duration.ofMinutes(ChatCacheConstants.CACHE_EXPIRE_AFTER_ACCESS_MINUTES))
            .build();

    @Override
    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {
        ApiKey apiKey = commonUserService.getApiKeyFromContext();

        // encrypted api key is stored in database, we need to decrypt it before returning
        String decryptedApiKey = apiKeyCrypto.decrypt(apiKey.getApiKey());

        ChatClient chatClient =
                getOrCreateClient(decryptedApiKey, apiKey.getModel().getApiValue());

        String outputText = "";

        long startTime = System.currentTimeMillis();

        try {

            var response = chatClient
                    .prompt(buildPrompt(systemMessage, userMessage))
                    .call()
                    .chatResponse();

            long duration = System.currentTimeMillis() - startTime;
            log.info(
                    "AI call success - model={} duration={}ms",
                    apiKey.getModel().getApiValue(),
                    duration);

            ChatResponseMetadata metadata = response.getMetadata();

            int promptTokens = safe(metadata.getUsage().getPromptTokens());
            int completionTokens = safe(metadata.getUsage().getCompletionTokens());
            int totalTokens = safe(metadata.getUsage().getTotalTokens());

            outputText = response.getResult().getOutput().getText();

            log.info(
                    "Tokens used - Prompt: {}, Completion: {}, Total: {}", promptTokens, completionTokens, totalTokens);

            T result = parseResponse(outputText, responseType);

            return ChatResponse.<T>builder()
                    .result(result)
                    .promptTokens(0)
                    .completionTokens(0)
                    .totalTokens(0)
                    .build();
        } catch (NonTransientAiException exception) {
            long duration = System.currentTimeMillis() - startTime;

            log.error(
                    "AI call failed - model={} duration={}ms error={}",
                    apiKey.getModel().getApiValue(),
                    duration,
                    exception.getMessage(),
                    exception);

            if (exception.getMessage() != null
                    && exception.getMessage().contains("429")
                    && exception.getMessage().contains("RESOURCE_EXHAUSTED")) {

                handleApiReachLimit(apiKey);
            }

            throw new AppException(ErrorCode.AI_EXHAUSTED);
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;

            log.error(
                    "AI response parsing failed - model={} duration={}ms",
                    apiKey.getModel().getApiValue(),
                    duration,
                    e);

            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
        }
    }

    private ChatClient getOrCreateClient(String apiKey, String model) {

        ClientKey key = new ClientKey(apiKey, model);

        return clientCache.get(key, k -> {
            OpenAiApi openAiApi = apiCache.get(k.apiKey(), this::buildApi);

            OpenAiChatModel geminiModel = OpenAiChatModel.builder()
                    .openAiApi(openAiApi)
                    .defaultOptions(OpenAiChatOptions.builder()
                            .model(k.model())
                            .maxCompletionTokens(5000)
                            .build())
                    .build();

            return ChatClient.builder(geminiModel).build();
        });
    }

    private OpenAiApi buildApi(String apiKey) {
        return OpenAiApi.builder()
                .apiKey(apiKey)
                .baseUrl("https://generativelanguage.googleapis.com")
                .completionsPath("/v1beta/openai/chat/completions")
                .build();
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        int inputToken = TokenUtils.countTokens(systemMessageText) + TokenUtils.countTokens(userMessageText);
        if (inputToken > ChatCacheConstants.MAX_INPUT_TOKENS) {
            throw new AppException(ErrorCode.AI_INPUT_TOO_LONG);
        }
        return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
    }

    private <T> T parseResponse(String outputText, Class<T> responseType) throws Exception {

        if (responseType == String.class) {
            return responseType.cast(outputText.trim());
        }

        String cleanedJson = cleanMarkdownJson(outputText);

        return objectMapper.readValue(cleanedJson, responseType);
    }

    private static int safe(Integer value) {
        return value != null ? value : 0;
    }

    private static String cleanMarkdownJson(String raw) {

        if (raw == null || raw.isBlank()) {
            throw new IllegalArgumentException("Response is empty");
        }

        if (!raw.contains("```")) {
            return raw.trim();
        }

        String cleaned = raw.replaceAll("```json", "").replaceAll("```", "").trim();

        int first = cleaned.indexOf('{');
        int last = cleaned.lastIndexOf('}');

        if (first >= 0 && last > first) {
            return cleaned.substring(first, last + 1);
        }

        throw new IllegalArgumentException("No valid JSON found in response");
    }

    private void handleApiReachLimit(ApiKey apiKey) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        apiKeyService.switchActiveKeyAfterDeactivate(userId, apiKey.getId());
    }
}
