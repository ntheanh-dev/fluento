package com.nta.service.ai.impl;

import com.nta.service.ai.AiChatService;
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
public class GeminiAiChatService implements AiChatService {

    @Override
    public <T> T sendMessage(String apiKey, String systemMessage, String userMessage, Class<T> responseType) {
        return this.buildChatClient(apiKey)
                .prompt(this.buildPrompt(systemMessage, userMessage))
                .call()
                .entity(responseType);
    }

    @Override
    public <T> T sendMessage(String apiKey, String systemMessage, String userMessage, ParameterizedTypeReference<T> responseType) {
        return this.buildChatClient(apiKey)
                .prompt(this.buildPrompt(systemMessage, userMessage))
                .call()
                .entity(responseType);
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

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        SystemMessage systemMessage = new SystemMessage(systemMessageText);
        UserMessage userMessage = new UserMessage(userMessageText);
        return new Prompt(systemMessage, userMessage);
    }
}
