package com.nta.domain.chatMemory;

import org.springframework.jdbc.core.JdbcTemplate;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@org.springframework.stereotype.Repository("chatMemoryRepository")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Repository {
    static final String CHAT_MEMORY_TABLE = "SPRING_AI_CHAT_MEMORY";
    JdbcTemplate jdbcTemplate;

    int deleteByConversationPrefix(String conversationPrefix) {
        return jdbcTemplate.update(
                "DELETE FROM " + CHAT_MEMORY_TABLE + " WHERE conversation_id LIKE ?", conversationPrefix + "%");
    }
}
