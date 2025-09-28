package com.nta.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AIChatService {

    private ChatClient chatClient;

    // For simple response types (e.g., String, Integer)
    public <T> T sendMessage(
            final String apiKey,
            final String systemMessageText,
            final String userMessageText,
            Class<T> responseType) {

        return this.buildChatClient(apiKey)
                .prompt(this.buildPrompt(systemMessageText, userMessageText))
                .call()
                .entity(responseType);
    }

    // For custom response class
    public <T> T sendMessage(
            final String apiKey,
            final String systemMessageText,
            final String userMessageText,
            ParameterizedTypeReference<T> responseType) {
        return this.buildChatClient(apiKey)
                .prompt(this.buildPrompt(systemMessageText, userMessageText))
                .call()
                .entity(responseType);
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        SystemMessage systemMessage = new SystemMessage(systemMessageText);
        UserMessage userMessage = new UserMessage(userMessageText);
        return new Prompt(systemMessage, userMessage);
    }

    private ChatClient buildChatClient(String apiKey) {
        OpenAiApi openAiApi =
                OpenAiApi.builder()
                        .apiKey(apiKey)
                        .baseUrl("https://generativelanguage.googleapis.com")
                        .completionsPath("/v1beta/openai/chat/completions")
                        .build();

        OpenAiChatModel geminiModel =
                OpenAiChatModel.builder()
                        .openAiApi(openAiApi)
                        .defaultOptions(
                                OpenAiChatOptions.builder().model("gemini-2.0-flash").build())
                        .build();

        return ChatClient.builder(geminiModel).build();
    }
}
