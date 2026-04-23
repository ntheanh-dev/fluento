package com.nta.common.service.ai.impl;

import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.context.annotation.Primary;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;

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
    //    "https://fluento.anhthenguyen-work.workers.dev/"
    //            "https://luyenviet.hoangthithanh04051980.workers.dev/"
    //            "https://luyenviet.thamnguyen38vv.workers.dev/",
    //            "https://luyenviet.2151013002anh.workers.dev/",
    //            "https://luyenviet.thamnguyenvv83.workers.dev/",
    //            "https://throbbing-smoke-c078.5dnpnjsjf6.workers.dev/",
    //            "https://luyenviet.theanhmgt1011.workers.dev/");
    private static final List<String> CLOUDFLARE_WORKER_BASE_URLS =
            List.of("https://luyenviet.theanhmgt1011.workers.dev/");
    private static final String CLOUDFLARE_WORKER_API_KEY = "12345";

    private final ObjectMapper objectMapper;
    private final com.nta.domain.chatMemory.Service chatMemoryService;

    @Override
    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {
        return sendMessageStream(systemMessage, userMessage, responseType, null);
    }

    @Override
    public <T> ChatResponse<T> sendMessageWithMemory(
            String conversationId, String systemMessage, String userMessage, Class<T> responseType) {
        return sendMessageStreamWithMemory(conversationId, systemMessage, userMessage, responseType, null);
    }

    @Override
    public <T> ChatResponse<T> sendMessageStream(
            String systemMessage, String userMessage, Class<T> responseType, Consumer<String> onChunk) {
        String outputText = doChatCall(systemMessage, userMessage, onChunk, null);
        T result = parseResponse(outputText, responseType);
        return ChatResponse.<T>builder()
                .result(result)
                .promptTokens(0)
                .completionTokens(0)
                .totalTokens(0)
                .build();
    }

    @Override
    public <T> ChatResponse<T> sendMessageStreamWithMemory(
            String conversationId,
            String systemMessage,
            String userMessage,
            Class<T> responseType,
            Consumer<String> onChunk) {
        String outputText = doChatCall(systemMessage, userMessage, onChunk, conversationId);
        T result = parseResponse(outputText, responseType);
        return ChatResponse.<T>builder()
                .result(result)
                .promptTokens(0)
                .completionTokens(0)
                .totalTokens(0)
                .build();
    }

    @Override
    public void clearConversationMemory(String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return;
        }
        chatMemoryService.clearConversation(conversationId);
    }

    @Override
    public void clearConversationMemoryByPrefix(String conversationPrefix) {
        if (conversationPrefix == null || conversationPrefix.isBlank()) {
            return;
        }
        chatMemoryService.clearByPrefix(conversationPrefix);
    }

    private <T> T parseResponse(String outputText, Class<T> responseType) {
        if (responseType == String.class) {
            return responseType.cast(outputText.trim());
        }
        try {
            ChatCompletionResponse outer = objectMapper.readValue(outputText, ChatCompletionResponse.class);
            if (outer.usage() != null) {
                log.info(
                        "AI call success - total tokens={} prompt tokens={} completion tokens={}",
                        outer.usage().total_tokens(),
                        outer.usage().prompt_tokens(),
                        outer.usage().completion_tokens());
            }
            String content = outer.choices().getFirst().message().content();
            String cleanJson = extractJson(content);
            return objectMapper.readValue(cleanJson, responseType);
        } catch (Exception e) {
            try {
                String cleanJson = extractJson(outputText);
                return objectMapper.readValue(cleanJson, responseType);
            } catch (Exception fallbackEx) {
                log.error(
                        "Failed to parse AI response into {}. Output was: {}",
                        responseType.getSimpleName(),
                        outputText,
                        fallbackEx);
                throw new RuntimeException("Failed to parse AI response", fallbackEx);
            }
        }
    }

    private List<String> workerBaseUrls() {
        return CLOUDFLARE_WORKER_BASE_URLS.stream()
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(this::normalizeBaseUrl)
                .toList();
    }

    private String normalizeBaseUrl(String baseUrl) {
        String t = baseUrl.trim();
        return t.endsWith("/") ? t : t + "/";
    }

    private ChatClient createClient(String baseUrl) {
        String url = normalizeBaseUrl(baseUrl);
        OpenAiApi openAiApi = OpenAiApi.builder()
                .apiKey(CLOUDFLARE_WORKER_API_KEY)
                .baseUrl(url)
                .build();

        OpenAiChatModel chatModel = OpenAiChatModel.builder()
                .openAiApi(openAiApi)
                .defaultOptions(OpenAiChatOptions.builder().build())
                .retryTemplate(RetryTemplate.builder().maxAttempts(1).build())
                .build();

        return ChatClient.builder(chatModel).build();
    }

    private boolean isRetryableError(NonTransientAiException e) {
        if (e.getMessage() == null) return false;
        String msg = e.getMessage().toLowerCase();
        return msg.contains("429")
                || msg.contains("4006")
                || msg.contains("resource_exhausted")
                || msg.contains("quota")
                || msg.contains("rate limit")
                || msg.contains("limit exceeded")
                || msg.contains("daily free allocation")
                || msg.contains("used up your daily free allocation")
                || msg.contains("neurons");
    }

    private static boolean isRetryableHttpStatus(int code) {
        return code == 429 || code == 502 || code == 503 || code == 504;
    }

    private boolean isRetryableWorkerFailure(Throwable e) {
        if (e instanceof NonTransientAiException nte) {
            return isRetryableError(nte);
        }
        if (e instanceof TransientAiException) {
            return true;
        }
        Throwable t = e;
        while (t != null) {
            if (t instanceof HttpStatusCodeException hsce
                    && isRetryableHttpStatus(hsce.getStatusCode().value())) {
                return true;
            }
            String msg = t.getMessage();
            if (msg != null) {
                String lower = msg.toLowerCase();
                if (lower.contains("429")
                        || lower.contains("4006")
                        || lower.contains("resource_exhausted")
                        || lower.contains("quota")
                        || lower.contains("rate limit")
                        || lower.contains("limit exceeded")
                        || lower.contains("too many requests")
                        || lower.contains("daily free allocation")
                        || lower.contains("used up your daily free allocation")
                        || lower.contains("neurons")) {
                    return true;
                }
            }
            t = t.getCause();
        }
        return false;
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText, String conversationId) {
        if (conversationId == null || conversationId.isBlank()) {
            return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
        }
        List<Message> memoryMessages = chatMemoryService.getMemoryMessages(conversationId);
        List<Message> promptMessages = new java.util.ArrayList<>(memoryMessages.size() + 2);
        promptMessages.add(new SystemMessage(systemMessageText));
        promptMessages.addAll(memoryMessages);
        promptMessages.add(new UserMessage(userMessageText));
        return new Prompt(promptMessages);
    }

    private void appendMemory(String conversationId, String userMessage, String assistantMessage) {
        if (conversationId == null || conversationId.isBlank()) {
            return;
        }
        chatMemoryService.addConversationExchange(conversationId, userMessage, assistantMessage);
    }

    private String doChatCall(
            String systemMessage, String userMessage, Consumer<String> onChunk, String conversationId) {
        List<String> baseUrls = workerBaseUrls();

        Prompt prompt = buildPrompt(systemMessage, userMessage, conversationId);
        Throwable lastFailure = null;

        for (int i = 0; i < baseUrls.size(); i++) {
            String baseUrl = baseUrls.get(i);
            ChatClient client = createClient(baseUrl);

            try {
                if (onChunk != null) {
                    StringBuilder fullContent = new StringBuilder();
                    client.prompt(prompt).stream()
                            .content()
                            .doOnNext(content -> {
                                fullContent.append(content);
                                onChunk.accept(content);
                            })
                            .blockLast();

                    String responseText = fullContent.toString();
                    appendMemory(conversationId, userMessage, responseText);
                    return responseText;
                } else {
                    String responseText = Objects.requireNonNull(
                                    client.prompt(prompt).call().chatResponse())
                            .getResult()
                            .getOutput()
                            .getText();
                    appendMemory(conversationId, userMessage, responseText);
                    return responseText;
                }
            } catch (Exception e) {
                lastFailure = e;
                if (i < baseUrls.size() - 1 && isRetryableWorkerFailure(e)) {
                    log.warn("Worker {} failed, retrying...", baseUrl);
                    continue;
                }
                throw new RuntimeException("AI call failed", e);
            }
        }
        throw new RuntimeException("All workers failed", lastFailure);
    }

    private String extractJson(String raw) {
        if (raw == null) return null;
        raw = raw.trim();
        if (raw.startsWith("```")) {
            raw = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        }
        raw = raw.replaceAll(",\\s*]", "]");

        return raw;
    }
}

record ChatCompletionResponse(
        String id, String object, long created, String model, List<Choice> choices, Usage usage) {}

record Choice(Message message) {
    record Message(String content) {}
}

record Usage(int prompt_tokens, int completion_tokens, int total_tokens) {}
