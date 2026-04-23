package com.nta.common.service.ai.impl;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.function.Consumer;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.nta.common.service.ai.ChatResponse;
import com.nta.common.service.ai.ChatService;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class LocalLlmChatService implements ChatService {

    @Value("${app.ai.local.base-url:http://localhost:1234/v1}")
    private String localLlmBaseUrl;

    @Value("${app.ai.local.api-key:}")
    private String localLlmApiKey;

    @Value("${app.ai.local.model:google/gemma-4-e4b}")
    private String localLlmModel;

    @Value("${app.ai.local.temperature:0.5}")
    private double temperature;

    @Value("${app.ai.local.max-tokens:2000}")
    private int maxTokens;

    @Value("${app.ai.local.response-format:json_schema}")
    private String responseFormat;

    @Value("${app.ai.local.request-timeout-ms:60000}")
    private long requestTimeoutMs;

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public LocalLlmChatService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .version(HttpClient.Version.HTTP_1_1)
                .build();
    }

    @Override
    public <T> ChatResponse<T> sendMessage(String systemMessage, String userMessage, Class<T> responseType) {
        return sendMessageStream(systemMessage, userMessage, responseType, null);
    }

    @Override
    public <T> ChatResponse<T> sendMessageStream(
            String systemMessage, String userMessage, Class<T> responseType, Consumer<String> onChunk) {
        String outputText;
        long startedAt = System.currentTimeMillis();
        try {
            outputText = doChatCall(systemMessage, userMessage, responseType);
        } catch (Exception e) {
            throw new RuntimeException("Local LLM call failed", e);
        }
        log.info("Local LLM response received in {} ms", System.currentTimeMillis() - startedAt);
        if (onChunk != null && !outputText.isEmpty()) {
            onChunk.accept(outputText);
        }
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
            String cleanJson = extractJson(outputText);
            return objectMapper.readValue(cleanJson, responseType);
        } catch (Exception e) {
            log.error(
                    "Failed to parse local LLM response into {}. Output was: {}",
                    responseType.getSimpleName(),
                    outputText,
                    e);
            throw new RuntimeException("Failed to parse local LLM response", e);
        }
    }

    private <T> String doChatCall(String systemMessage, String userMessage, Class<T> responseType) throws Exception {
        String endpoint = normalizeBaseUrl(localLlmBaseUrl) + "chat/completions";
        String requestBody = buildRequestBody(systemMessage, userMessage, responseType);

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .timeout(Duration.ofMillis(requestTimeoutMs))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody));
        if (localLlmApiKey != null && !localLlmApiKey.isBlank()) {
            requestBuilder.header("Authorization", "Bearer " + localLlmApiKey);
        }
        HttpRequest request = requestBuilder.build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new RuntimeException(
                    "Local LLM call failed with status " + response.statusCode() + " body: " + response.body());
        }

        JsonNode responseNode = objectMapper.readTree(response.body());
        JsonNode contentNode =
                responseNode.path("choices").path(0).path("message").path("content");
        if (contentNode.isMissingNode() || contentNode.isNull()) {
            throw new RuntimeException("Local LLM returned empty message content");
        }
        return contentNode.asText("");
    }

    private <T> String buildRequestBody(String systemMessage, String userMessage, Class<T> responseType)
            throws Exception {
        ObjectNode root = objectMapper.createObjectNode();
        root.put("model", localLlmModel);
        root.put("temperature", temperature);
        root.put("max_tokens", maxTokens);

        if (responseType != String.class) {
            ObjectNode responseFormatNode = root.putObject("response_format");
            String normalizedFormat = responseFormat == null
                    ? "json_schema"
                    : responseFormat.trim().toLowerCase();
            responseFormatNode.put("type", normalizedFormat);
            if ("json_schema".equals(normalizedFormat)) {
                ObjectNode jsonSchema = responseFormatNode.putObject("json_schema");
                jsonSchema.put("name", "vocab_response");
                jsonSchema.set("schema", buildVocabSchema());
            }
        }

        ArrayNode messages = root.putArray("messages");
        messages.add(objectMapper.createObjectNode().put("role", "system").put("content", systemMessage));
        messages.add(objectMapper.createObjectNode().put("role", "user").put("content", userMessage));

        return objectMapper.writeValueAsString(root);
    }

    private JsonNode buildVocabSchema() {
        ObjectNode itemProperties = objectMapper.createObjectNode();
        itemProperties.set("vietnamese", objectMapper.createObjectNode().put("type", "string"));

        ObjectNode englishItemProperties = objectMapper.createObjectNode();
        englishItemProperties.set("english", objectMapper.createObjectNode().put("type", "string"));
        englishItemProperties.set(
                "partsOfSpeech", objectMapper.createObjectNode().put("type", "string"));
        englishItemProperties.set(
                "ipaPronunciation", objectMapper.createObjectNode().put("type", "string"));

        ObjectNode englishItem = objectMapper.createObjectNode();
        englishItem.put("type", "object");
        englishItem.set("properties", englishItemProperties);
        englishItem.set(
                "required",
                objectMapper
                        .createArrayNode()
                        .add("english")
                        .add("partsOfSpeech")
                        .add("ipaPronunciation"));

        ObjectNode englishArray = objectMapper.createObjectNode();
        englishArray.put("type", "array");
        englishArray.set("items", englishItem);
        englishArray.put("minItems", 1);
        itemProperties.set("english", englishArray);

        ObjectNode itemSchema = objectMapper.createObjectNode();
        itemSchema.put("type", "object");
        itemSchema.set("properties", itemProperties);
        itemSchema.set(
                "required", objectMapper.createArrayNode().add("vietnamese").add("english"));

        ObjectNode schema = objectMapper.createObjectNode();
        schema.put("type", "array");
        schema.set("items", itemSchema);
        return schema;
    }

    private String normalizeBaseUrl(String baseUrl) {
        String t = baseUrl.trim();
        if (t.startsWith("http://localhost")) {
            t = t.replaceFirst("http://localhost", "http://127.0.0.1");
        } else if (t.startsWith("https://localhost")) {
            t = t.replaceFirst("https://localhost", "https://127.0.0.1");
        }
        if (t.endsWith("/")) {
            return t;
        }
        return t + "/";
    }

    private String extractJson(String raw) {
        if (raw == null) return null;
        raw = raw.trim();
        if (raw.startsWith("```")) {
            raw = raw.replaceAll("```json", "").replaceAll("```", "").trim();
        }
        return raw.replaceAll(",\\s*]", "]");
    }
}
