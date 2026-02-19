package com.nta.domain.ai.impl;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

import com.nta.domain.ai.ChatService;

@Service
public class GeminiChatService implements ChatService {

    final ChatClient chatClient;

    public GeminiChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public <T> T sendMessage(String apiKey, String systemMessage, String userMessage, Class<T> responseType) {
        return this.chatClient
                .prompt(this.buildPrompt(systemMessage, userMessage))
                .call()
                .entity(responseType);
    }

    @Override
    public <T> T sendMessage(
            String apiKey, String systemMessage, String userMessage, ParameterizedTypeReference<T> responseType) {
        return this.chatClient
                .prompt(this.buildPrompt(systemMessage, userMessage))
                .call()
                .entity(responseType);
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        SystemMessage systemMessage = new SystemMessage(systemMessageText);
        UserMessage userMessage = new UserMessage(userMessageText);
        return new Prompt(systemMessage, userMessage);
    }
}
