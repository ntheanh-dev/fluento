// package com.nta.common.service.ai.impl;
//
// import java.time.Duration;
//
// import org.springframework.ai.chat.client.ChatClient;
// import org.springframework.ai.chat.messages.SystemMessage;
// import org.springframework.ai.chat.messages.UserMessage;
// import org.springframework.ai.chat.prompt.Prompt;
// import org.springframework.ai.openai.OpenAiChatModel;
// import org.springframework.ai.openai.OpenAiChatOptions;
// import org.springframework.ai.openai.api.OpenAiApi;
// import org.springframework.ai.openai.api.ResponseFormat;
// import org.springframework.ai.retry.NonTransientAiException;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.util.StringUtils;
//
// import com.fasterxml.jackson.databind.ObjectMapper;
// import com.github.benmanes.caffeine.cache.Cache;
// import com.github.benmanes.caffeine.cache.Caffeine;
// import com.nta.common.constant.ChatCacheConstants;
// import com.nta.common.enums.ErrorCode;
// import com.nta.common.exception.AppException;
// import com.nta.common.service.CommonUserService;
// import com.nta.common.service.ai.ChatResponse;
// import com.nta.common.service.ai.ChatService;
// import com.nta.common.service.ai.ClientKey;
// import com.nta.domain.creditTransaction.CreditTransaction;
//
// import io.sentry.Sentry;
// import lombok.RequiredArgsConstructor;
// import lombok.extern.slf4j.Slf4j;
//
/// **
// * Gemini qua OpenAI-compatible API, dùng API key cấu hình server (không còn key theo user).
// */
// @Service
// @Slf4j
// @RequiredArgsConstructor
// public class GeminiChatService implements ChatService {
//
//    private final CommonUserService commonUserService;
//    private final ObjectMapper objectMapper;
//    private final com.nta.domain.creditTransaction.Service creditTransactionService;
//
//    @Value("${spring.ai.openai.api-key:}")
//    private String serverGeminiApiKey;
//
//    @Value("${spring.ai.openai.chat.options.model:gemini-2.5-flash}")
//    private String chatModel;
//
//    private final Cache<String, OpenAiApi> apiCache = Caffeine.newBuilder()
//            .maximumSize(ChatCacheConstants.API_CACHE_MAX_SIZE)
//            .expireAfterAccess(Duration.ofMinutes(ChatCacheConstants.CACHE_EXPIRE_AFTER_ACCESS_MINUTES))
//            .build();
//
//    private final Cache<ClientKey, ChatClient> clientCache = Caffeine.newBuilder()
//            .maximumSize(ChatCacheConstants.CLIENT_CACHE_MAX_SIZE)
//            .expireAfterAccess(Duration.ofMinutes(ChatCacheConstants.CACHE_EXPIRE_AFTER_ACCESS_MINUTES))
//            .build();
//
//    private static final int CREDIT_PER_AI_CALL = 1;
//
//    @Override
//    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {
//
//        if (!StringUtils.hasText(serverGeminiApiKey)) {
//            throw new AppException(ErrorCode.AI_API_KEY_MISSING);
//        }
//
//        Long userId = commonUserService.getCurrentUserIdFromContext();
//        CreditTransaction tx = creditTransactionService.reserveCredit(userId, 1L);
//
//        long startTime = System.currentTimeMillis();
//
//        try {
//            String outputText = doChatCall(serverGeminiApiKey, chatModel, systemMessage, userMessage);
//
//            long duration = System.currentTimeMillis() - startTime;
//            log.info("AI call success - txId={} model={} duration={}ms", tx.getId(), chatModel, duration);
//
//            T result = parseResponse(outputText, responseType);
//
//            creditTransactionService.commitTransaction(tx.getId());
//
//            return ChatResponse.<T>builder()
//                    .result(result)
//                    .promptTokens(0)
//                    .completionTokens(0)
//                    .totalTokens(0)
//                    .build();
//        } catch (NonTransientAiException exception) {
//            creditTransactionService.refundTransaction(tx.getId());
//
//            long duration = System.currentTimeMillis() - startTime;
//            log.warn(
//                    "AI call failed - txId={} model={} duration={}ms error={}",
//                    tx.getId(),
//                    chatModel,
//                    duration,
//                    exception.getMessage());
//
//            if (isRetryableError(exception)) {
//                throw new AppException(ErrorCode.AI_EXHAUSTED);
//            }
//
//            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
//        } catch (Exception e) {
//            creditTransactionService.refundTransaction(tx.getId());
//
//            long duration = System.currentTimeMillis() - startTime;
//
//            log.error(
//                    "AI response parsing failed - txId={} model={} duration={}ms", tx.getId(), chatModel, duration,
// e);
//
//            Sentry.captureException(e);
//
//            throw new AppException(ErrorCode.AI_RESPONSE_PARSE_ERROR);
//        }
//    }
//
//    private ChatClient getOrCreateClient(String apiKey, String model) {
//
//        ClientKey key = new ClientKey(apiKey, model);
//
//        return clientCache.get(key, k -> {
//            OpenAiApi openAiApi = apiCache.get(k.apiKey(), this::buildApi);
//
//            OpenAiChatModel geminiModel = OpenAiChatModel.builder()
//                    .openAiApi(openAiApi)
//                    .defaultOptions(OpenAiChatOptions.builder()
//                            .model(k.model())
//                            .maxCompletionTokens(5000)
//                            .temperature(0.2)
//                            .responseFormat(ResponseFormat.builder()
//                                    .type(ResponseFormat.Type.JSON_OBJECT)
//                                    .build())
//                            .topP(0.9)
//                            .build())
//                    .build();
//
//            return ChatClient.builder(geminiModel).build();
//        });
//    }
//
//    private OpenAiApi buildApi(String apiKey) {
//        return OpenAiApi.builder()
//                .apiKey(apiKey)
//                .baseUrl("https://generativelanguage.googleapis.com")
//                .completionsPath("/v1beta/openai/chat/completions")
//                .build();
//    }
//
//    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
//        return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
//    }
//
//    private <T> T parseResponse(String outputText, Class<T> responseType) throws Exception {
//
//        if (responseType == String.class) {
//            return responseType.cast(outputText.trim());
//        }
//        return objectMapper.readValue(outputText, responseType);
//    }
//
//    private boolean isRetryableError(NonTransientAiException e) {
//        if (e.getMessage() == null) return false;
//        String msg = e.getMessage().toLowerCase();
//        return msg.contains("429")
//                || msg.contains("resource_exhausted")
//                || msg.contains("quota")
//                || msg.contains("rate limit")
//                || msg.contains("limit exceeded");
//    }
//
//    private String doChatCall(String apiKeyPlain, String model, String systemMessage, String userMessage) {
//        ChatClient client = getOrCreateClient(apiKeyPlain, model);
//        var response =
//                client.prompt(buildPrompt(systemMessage, userMessage)).call().chatResponse();
//        int totalTokens = response.getMetadata().getUsage().getTotalTokens();
//        int inputToken = response.getMetadata().getUsage().getPromptTokens();
//        int outputToken = response.getMetadata().getUsage().getCompletionTokens();
//        log.info(
//                "AI call token usage - model={} totalTokens={} inputTokens={} outputTokens={}",
//                model,
//                totalTokens,
//                inputToken,
//                outputToken);
//        return response.getResult().getOutput().getText();
//    }
// }
