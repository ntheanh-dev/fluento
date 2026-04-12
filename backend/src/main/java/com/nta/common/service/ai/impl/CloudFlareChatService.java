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
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.context.annotation.Primary;
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

    private static final List<String> CLOUDFLARE_WORKER_BASE_URLS =
            List.of("https://luyenviet.theanhmgt66.workers.dev/");

    private static final String CLOUDFLARE_WORKER_API_KEY = "12345";

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

            //            return objectMapper.readValue(extractJson(outputText), responseType);
        } catch (Exception e) {
            log.error(
                    "Failed to parse AI response into {}. Output was: {}", responseType.getSimpleName(), outputText, e);
            throw new RuntimeException("Failed to parse AI response", e);
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
                .build();

        return ChatClient.builder(chatModel).build();
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

    private static boolean isRetryableHttpStatus(int code) {
        return code == 429 || code == 502 || code == 503 || code == 504;
    }

    /**
     * Lỗi có thể chuyển sang worker khác (limit, quá tải, HTTP tạm thời).
     */
    private boolean isRetryableWorkerFailure(Throwable e) {
        if (e instanceof NonTransientAiException nte) {
            return isRetryableError(nte);
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
                        || lower.contains("resource_exhausted")
                        || lower.contains("quota")
                        || lower.contains("rate limit")
                        || lower.contains("limit exceeded")
                        || lower.contains("too many requests")) {
                    return true;
                }
            }
            t = t.getCause();
        }
        return false;
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
    }

    private String doChatCall(String systemMessage, String userMessage) {
        List<String> baseUrls = workerBaseUrls();
        if (baseUrls.isEmpty()) {
            throw new IllegalStateException("CLOUDFLARE_WORKER_BASE_URLS is empty");
        }

        Prompt prompt = buildPrompt(systemMessage, userMessage);
        Throwable lastFailure = null;

        for (int i = 0; i < baseUrls.size(); i++) {
            String baseUrl = baseUrls.get(i);
            ChatClient client = createClient(baseUrl);
            try {
                return Objects.requireNonNull(client.prompt(prompt).call().chatResponse())
                        .getResult()
                        .getOutput()
                        .getText();
            } catch (Exception e) {
                lastFailure = e;
                boolean hasNext = i < baseUrls.size() - 1;
                if (hasNext && isRetryableWorkerFailure(e)) {
                    log.warn("Cloudflare worker failed ({}), retrying next worker: {}", baseUrl, e.getMessage());
                    continue;
                }
                log.error("AI call failed on worker {}", baseUrl, e);
                throw new RuntimeException("AI call failed", e);
            }
        }

        throw new RuntimeException("AI call failed on all workers", lastFailure);
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
