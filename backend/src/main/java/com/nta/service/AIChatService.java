package com.nta.service;

import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AIChatService {
    private final UserApiKeyService userApiKeyService;
    private final ChatClientFactory chatClientFactory;

    public AIChatService(UserApiKeyService userApiKeyService, ChatClientFactory chatClientFactory) {
        this.userApiKeyService = userApiKeyService;
        this.chatClientFactory = chatClientFactory;
    }

    private ChatClient requireClientForCurrentUser() {
        final String apiKey = userApiKeyService.getRequiredApiKey();
        if (apiKey == null || apiKey.isBlank()) {
            throw new AppException(ErrorCode.AI_API_KEY_MISSING);
        }
        return chatClientFactory.buildForApiKey(apiKey);
    }

    public boolean isApiKeyValid(final String apiKey) {
        try {
            final ChatClient chatClient = chatClientFactory.buildForApiKey(apiKey);
            chatClient.prompt(new Prompt(new SystemMessage("Say 'Hello'"), new UserMessage("Hello"))).call().content();
            return true;
        } catch (RuntimeException ex) {
            log.error("Failed to validate API key", ex);
            return false;
        }
    }

    // For simple response types (e.g., String, Integer)
    public <T> T sendMessage(
            final String conversationId,
            final String systemMessageText,
            final String userMessageText,
            Class<T> responseType) {
        final ChatClient chatClient = requireClientForCurrentUser();
        try {
            return chatClient
                    .prompt(this.buildPrompt(systemMessageText, userMessageText))
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .call()
                    .entity(responseType);
        } catch (RuntimeException ex) {
            // Treat auth-related failures as invalid key
            throw new AppException(ErrorCode.AI_API_KEY_INVALID);
        }
    }

    // For custom response class
    public <T> T sendMessage(
            final String conversationId,
            final String systemMessageText,
            final String userMessageText,
            ParameterizedTypeReference<T> responseType) {
        final ChatClient chatClient = requireClientForCurrentUser();
        try {
            return chatClient
                    .prompt(this.buildPrompt(systemMessageText, userMessageText))
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .call()
                    .entity(responseType);
        } catch (RuntimeException ex) {
            throw new AppException(ErrorCode.AI_API_KEY_INVALID);
        }
    }

    private Prompt buildPrompt(String systemMessageText, String userMessageText) {
        SystemMessage systemMessage = new SystemMessage(systemMessageText);
        UserMessage userMessage = new UserMessage(userMessageText);
        return new Prompt(systemMessage, userMessage);
    }
}
