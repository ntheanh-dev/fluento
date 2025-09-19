package com.nta.service;

import com.nta.configuration.AiModelProperties;
import com.nta.repository.CustomJdbcChatMemoryRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatClientFactory {

    AiModelProperties properties;
    CustomJdbcChatMemoryRepository customJdbcChatMemoryRepository;

    public ChatClient buildForApiKey(String apiKey) {
        final OpenAiApi openAiApi =
                OpenAiApi.builder()
                        .baseUrl(properties.getBaseUrl())
                        .completionsPath(properties.getCompletionsPath())
                        .apiKey(apiKey)
                        .build();

        final OpenAiChatOptions options =
                OpenAiChatOptions.builder().model(properties.getModel()).build();

        final OpenAiChatModel model =
                OpenAiChatModel.builder().openAiApi(openAiApi).defaultOptions(options).build();

        return ChatClient.builder(model)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(
                                        jdbcChatMemory(customJdbcChatMemoryRepository))
                                .build())
                .build();
    }

    public ChatMemory jdbcChatMemory(CustomJdbcChatMemoryRepository jdbcChatMemoryRepository) {
        return MessageWindowChatMemory.builder()
                .chatMemoryRepository(jdbcChatMemoryRepository)
                .maxMessages(30)
                .build();
    }
}
