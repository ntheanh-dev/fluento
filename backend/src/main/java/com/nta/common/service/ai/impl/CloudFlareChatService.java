package com.nta.common.service.ai.impl;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.function.Consumer;

import org.springframework.ai.chat.client.ChatClient;
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
import org.springframework.web.client.UnknownContentTypeException;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.ai.ChatResponse;
import com.nta.common.service.ai.ChatService;
import com.nta.domain.creditTransaction.CreditTransaction;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@Primary
public class CloudFlareChatService implements ChatService {

    private static final List<String> CLOUDFLARE_WORKER_BASE_URLS = List.of(
            //            "https://fluento.anhthenguyen-work.workers.dev/",
            //            "https://luyenviet.thamnguyen38vv.workers.dev/ ",
            //            "https://luyenviet.2151013002anh.workers.dev/",
            //            "https://luyenviet.thamnguyenvv83.workers.dev/",
            //            "https://throbbing-smoke-c078.5dnpnjsjf6.workers.dev/",
            //            "https://luyenviet.theanhmgt1011.workers.dev/"
            "https://luyenviet.hoangthithanh04051980.workers.dev/");
    private static final String CLOUDFLARE_WORKER_API_KEY = "12345";
    private static final String DEFAULT_MODEL = "@cf/aisingapore/gemma-sea-lion-v4-27b-it";
    private static final long CREDIT_PER_AI_CALL = 1L;

    private final ObjectMapper objectMapper;
    private final CommonUserService commonUserService;
    private final com.nta.domain.creditTransaction.Service creditTransactionService;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {
        return sendMessageStream(systemMessage, userMessage, responseType, null);
    }

    @Override
    public <T> ChatResponse<T> sendMessageStream(
            String systemMessage, String userMessage, Class<T> responseType, Consumer<String> onChunk) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        CreditTransaction tx = creditTransactionService.reserveCredit(userId, CREDIT_PER_AI_CALL);
        try {
            String outputText = doChatCall(systemMessage, userMessage, onChunk);
            T result = parseResponse(outputText, responseType);
            creditTransactionService.commitTransaction(tx.getId());
            return ChatResponse.<T>builder()
                    .result(result)
                    .promptTokens(0)
                    .completionTokens(0)
                    .totalTokens(0)
                    .build();
        } catch (Exception e) {
            creditTransactionService.refundTransaction(tx.getId());
            throw e;
        }
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

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        return new Prompt(new SystemMessage(systemMessageText), new UserMessage(userMessageText));
    }

    private String doChatCall(String systemMessage, String userMessage) {
        return doChatCall(systemMessage, userMessage, null);
    }

    private String doChatCall(String systemMessage, String userMessage, Consumer<String> onChunk) {
        List<String> baseUrls = workerBaseUrls();
        if (baseUrls.isEmpty()) {
            throw new IllegalStateException("CLOUDFLARE_WORKER_BASE_URLS is empty");
        }

        Prompt prompt = buildPrompt(systemMessage, userMessage);
        Throwable lastFailure = null;

        for (int i = 0; i < baseUrls.size(); i++) {
            String baseUrl = baseUrls.get(i);
            if (onChunk != null) {
                try {
                    return doChatCallStreamFallback(baseUrl, systemMessage, userMessage, onChunk);
                } catch (Exception streamEx) {
                    lastFailure = streamEx;
                    boolean hasNext = i < baseUrls.size() - 1;
                    if (hasNext && isRetryableWorkerFailure(streamEx)) {
                        log.warn(
                                "Cloudflare stream call failed ({}), retrying next worker: {}",
                                baseUrl,
                                streamEx.getMessage());
                        continue;
                    }
                    log.error("AI stream call failed on worker {}", baseUrl, streamEx);
                    throw new RuntimeException("AI call failed", streamEx);
                }
            }
            ChatClient client = createClient(baseUrl);
            try {
                return Objects.requireNonNull(client.prompt(prompt).call().chatResponse())
                        .getResult()
                        .getOutput()
                        .getText();
            } catch (Exception e) {
                if (isEventStreamContentTypeError(e)) {
                    try {
                        return doChatCallStreamFallback(baseUrl, systemMessage, userMessage, onChunk);
                    } catch (Exception streamEx) {
                        lastFailure = streamEx;
                        boolean hasNext = i < baseUrls.size() - 1;
                        if (hasNext && isRetryableWorkerFailure(streamEx)) {
                            log.warn(
                                    "Cloudflare stream fallback failed ({}), retrying next worker: {}",
                                    baseUrl,
                                    streamEx.getMessage());
                            continue;
                        }
                        log.error("AI stream fallback failed on worker {}", baseUrl, streamEx);
                        throw new RuntimeException("AI call failed", streamEx);
                    }
                }
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

    private boolean isEventStreamContentTypeError(Throwable e) {
        Throwable t = e;
        while (t != null) {
            if (t instanceof UnknownContentTypeException ucte
                    && ucte.getContentType() != null
                    && "text/event-stream"
                            .equalsIgnoreCase(ucte.getContentType().toString())) {
                return true;
            }
            t = t.getCause();
        }
        return false;
    }

    private String doChatCallStreamFallback(
            String baseUrl, String systemMessage, String userMessage, Consumer<String> onChunk) throws Exception {
        String endpoint = normalizeBaseUrl(baseUrl) + "v1/chat/completions";
        String requestBody = objectMapper
                .createObjectNode()
                .put("model", DEFAULT_MODEL)
                .put("stream", true)
                .set(
                        "messages",
                        objectMapper
                                .createArrayNode()
                                .add(objectMapper
                                        .createObjectNode()
                                        .put("role", "system")
                                        .put("content", systemMessage))
                                .add(objectMapper
                                        .createObjectNode()
                                        .put("role", "user")
                                        .put("content", userMessage)))
                .toString();

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Authorization", "Bearer " + CLOUDFLARE_WORKER_API_KEY)
                .header("Content-Type", "application/json")
                .header("Accept", "text/event-stream")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<java.io.InputStream> response =
                httpClient.send(request, HttpResponse.BodyHandlers.ofInputStream());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            String errorBody = new String(response.body().readAllBytes(), StandardCharsets.UTF_8);
            throw new RuntimeException(
                    "Cloudflare stream fallback failed with status " + response.statusCode() + " body: " + errorBody);
        }

        StringBuilder fullText = new StringBuilder();
        try (BufferedReader reader =
                new BufferedReader(new InputStreamReader(response.body(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = reader.readLine()) != null) {
                String payload = line.trim();
                if (payload.isEmpty()) continue;
                if (payload.startsWith("data:")) {
                    payload = payload.substring(5).trim();
                }
                if ("[DONE]".equals(payload)) {
                    break;
                }
                if (!payload.startsWith("{")) {
                    continue;
                }
                try {
                    JsonNode node = objectMapper.readTree(payload);
                    JsonNode contentNode =
                            node.path("choices").path(0).path("delta").path("content");
                    if (!contentNode.isMissingNode() && !contentNode.isNull()) {
                        String content = contentNode.asText();
                        fullText.append(content);
                        if (onChunk != null && !content.isEmpty()) {
                            onChunk.accept(content);
                        }
                    }
                } catch (Exception ignored) {
                    // Ignore malformed stream lines and continue collecting valid chunks.
                }
            }
        }

        if (fullText.isEmpty()) {
            throw new RuntimeException("Cloudflare stream fallback returned empty content");
        }
        return fullText.toString();
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
