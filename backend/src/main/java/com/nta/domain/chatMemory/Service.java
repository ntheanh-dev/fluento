package com.nta.domain.chatMemory;

import java.util.List;
import javax.sql.DataSource;

import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.chat.memory.repository.jdbc.JdbcChatMemoryRepository;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.UserMessage;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@org.springframework.stereotype.Service("chatMemoryDomainService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Service {
    static final int PREVIEW_MEMORY_MAX_MESSAGES = 12;
    final DataSource dataSource;
    final Repository repository;
    ChatMemory chatMemory;

    @jakarta.annotation.PostConstruct
    void initChatMemory() {
        ChatMemory initializedChatMemory = MessageWindowChatMemory.builder()
                .chatMemoryRepository(JdbcChatMemoryRepository.builder()
                        .dataSource(dataSource)
                        .build())
                .maxMessages(PREVIEW_MEMORY_MAX_MESSAGES)
                .build();
        this.chatMemory = initializedChatMemory;
    }

    public List<Message> getMemoryMessages(String conversationId) {
        return chatMemory.get(conversationId);
    }

    public void addConversationExchange(String conversationId, String userMessage, String assistantMessage) {
        chatMemory.add(conversationId, List.of(new UserMessage(userMessage), new AssistantMessage(assistantMessage)));
    }

    public void clearConversation(String conversationId) {
        chatMemory.clear(conversationId);
    }

    public void clearByPrefix(String conversationPrefix) {
        repository.deleteByConversationPrefix(conversationPrefix);
    }
}
