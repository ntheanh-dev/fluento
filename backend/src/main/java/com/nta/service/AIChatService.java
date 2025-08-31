package com.nta.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

@Service
public class AIChatService {
    private final ChatClient chatClient;

    public AIChatService(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    // For simple response types (e.g., String, Integer)
    public <T> T sendMessage(final String conversationId, final String systemMessageText, final String userMessageText, Class<T> responseType) {
        return chatClient
                .prompt(this.buildPrompt(systemMessageText, userMessageText))
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .entity(responseType);
    }

    // For custom response class
    public <T> T sendMessage(final String conversationId,
                             final String systemMessageText,
                             final String userMessageText,
                             ParameterizedTypeReference<T> responseType) {

        return chatClient
                .prompt(this.buildPrompt(systemMessageText, userMessageText))
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                .call()
                .entity(responseType);
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        SystemMessage systemMessage = new SystemMessage(systemMessageText);
        UserMessage userMessage = new UserMessage(userMessageText);
        return new Prompt(systemMessage, userMessage);
    }

}
