package com.nta.common.service.ai.impl;

import java.time.Duration;
import java.util.List;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.openai.api.ResponseFormat;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import com.nta.common.constant.ChatCacheConstants;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.ai.ChatResponse;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ClientKey;
import com.nta.domain.apikey.ApiKey;
import com.nta.domain.creditTransaction.CreditTransaction;

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
    private final com.nta.domain.creditTransaction.Service creditTransactionService;
    private final Cache<String, OpenAiApi> apiCache = Caffeine.newBuilder()
            .maximumSize(ChatCacheConstants.API_CACHE_MAX_SIZE)
            .expireAfterAccess(Duration.ofMinutes(ChatCacheConstants.CACHE_EXPIRE_AFTER_ACCESS_MINUTES))
            .build();

    private final Cache<ClientKey, ChatClient> clientCache = Caffeine.newBuilder()
            .maximumSize(ChatCacheConstants.CLIENT_CACHE_MAX_SIZE)
            .expireAfterAccess(Duration.ofMinutes(ChatCacheConstants.CACHE_EXPIRE_AFTER_ACCESS_MINUTES))
            .build();

    private static final int CREDIT_PER_AI_CALL = 1;

    @Override
    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {

        ApiKey apiKey = commonUserService.getApiKeyFromContext();

        Long userId = commonUserService.getCurrentUserIdFromContext();
        CreditTransaction tx = creditTransactionService.reserveCredit(userId, 1L);

        try {
            apiKeyService.deductCredit(apiKey.getId(), CREDIT_PER_AI_CALL);
        } catch (AppException e) {
            creditTransactionService.refundTransaction(tx.getId());
            throw e;
        }

        long startTime = System.currentTimeMillis();

        try {
            String outputText = doChatCall(apiKey, systemMessage, userMessage);

            long duration = System.currentTimeMillis() - startTime;
            log.info(
                    "AI call success - txId={} model={} duration={}ms",
                    tx.getId(),
                    apiKey.getModel().getApiValue(),
                    duration);

            T result = parseResponse(outputText, responseType);

            creditTransactionService.commitTransaction(tx.getId());

            return ChatResponse.<T>builder()
                    .result(result)
                    .promptTokens(0)
                    .completionTokens(0)
                    .totalTokens(0)
                    .build();
        } catch (NonTransientAiException exception) {
            creditTransactionService.refundTransaction(tx.getId());
            apiKeyService.refundCredit(apiKey.getId(), CREDIT_PER_AI_CALL);

            long duration = System.currentTimeMillis() - startTime;
            log.warn(
                    "AI call failed - txId={} model={} duration={}ms error={}",
                    tx.getId(),
                    apiKey.getModel().getApiValue(),
                    duration,
                    exception.getMessage());

            if (isRetryableError(exception)) {
                RetryResult retryResult = retryWithOtherKeys(userId, tx, apiKey, systemMessage, userMessage, startTime);
                if (retryResult.outputText() != null) {
                    try {
                        T result = parseResponse(retryResult.outputText(), responseType);
                        creditTransactionService.commitTransaction(tx.getId());
                        apiKeyService.setUserActiveApiKeyId(
                                userId, retryResult.successfulKey().getId());
                        return ChatResponse.<T>builder()
                                .result(result)
                                .promptTokens(0)
                                .completionTokens(0)
                                .totalTokens(0)
                                .build();
                    } catch (Exception parseEx) {
                        creditTransactionService.refundTransaction(tx.getId());
                        log.error("AI response parse failed after retry", parseEx);
                        throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
                    }
                }
                apiKeyService.setUserActiveApiKeyId(userId, null);
            }

            throw new AppException(ErrorCode.AI_EXHAUSTED);
        } catch (Exception e) {
            creditTransactionService.refundTransaction(tx.getId());
            apiKeyService.refundCredit(apiKey.getId(), CREDIT_PER_AI_CALL);

            long duration = System.currentTimeMillis() - startTime;

            log.error(
                    "AI response parsing failed - txId={} model={} duration={}ms",
                    tx.getId(),
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
                            .temperature(0.2)
                            .responseFormat(ResponseFormat.builder()
                                    .type(ResponseFormat.Type.JSON_OBJECT)
                                    .build())
                            .topP(0.9)
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
        return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
    }

    private <T> T parseResponse(String outputText, Class<T> responseType) throws Exception {

        if (responseType == String.class) {
            return responseType.cast(outputText.trim());
        }
        return objectMapper.readValue(outputText, responseType);
    }

    private boolean isRetryableError(NonTransientAiException e) {
        if (e.getMessage() == null) return false;
        String msg = e.getMessage().toLowerCase();
        return msg.contains("429")
                || msg.contains("resource_exhausted")
                || msg.contains("quota")
                || msg.contains("rate limit")
                || msg.contains("limit exceeded");
    }

    private record RetryResult(String outputText, ApiKey successfulKey) {}

    /**
     * Thử gọi AI với các API key khác của user. Trả về outputText + key thành công, hoặc (null, null) nếu đều lỗi.
     */
    private RetryResult retryWithOtherKeys(
            Long userId,
            CreditTransaction tx,
            ApiKey failedKey,
            String systemMessage,
            String userMessage,
            long startTime) {
        List<ApiKey> others = apiKeyService.getOtherActiveKeysWithCredit(userId, failedKey.getId());
        for (ApiKey other : others) {
            try {
                apiKeyService.deductCredit(other.getId(), CREDIT_PER_AI_CALL);
                String outputText = doChatCall(other, systemMessage, userMessage);
                long duration = System.currentTimeMillis() - startTime;
                log.info(
                        "AI call success after retry - txId={} model={} duration={}ms",
                        tx.getId(),
                        other.getModel().getApiValue(),
                        duration);
                return new RetryResult(outputText, other);
            } catch (Exception e) {
                apiKeyService.refundCredit(other.getId(), CREDIT_PER_AI_CALL);
                log.warn("Retry with key id={} failed: {}", other.getId(), e.getMessage());
            }
        }
        return new RetryResult(null, null);
    }

    /**
     * Gọi Gemini với một ApiKey, trả về raw output text. Ném exception nếu lỗi.
     */
    private String doChatCall(ApiKey apiKey, String systemMessage, String userMessage) {
        String decrypted = apiKeyCrypto.decrypt(apiKey.getApiKey());
        ChatClient client = getOrCreateClient(decrypted, apiKey.getModel().getApiValue());
        var response =
                client.prompt(buildPrompt(systemMessage, userMessage)).call().chatResponse();
        int totalTokens = response.getMetadata().getUsage().getTotalTokens();
        int inputToken = response.getMetadata().getUsage().getPromptTokens();
        int outputToken = response.getMetadata().getUsage().getCompletionTokens();
        log.info(
                "AI call token usage - model={} totalTokens={} inputTokens={} outputTokens={}",
                apiKey.getModel().getApiValue(),
                totalTokens,
                inputToken,
                outputToken);
        return response.getResult().getOutput().getText();
    }
}
