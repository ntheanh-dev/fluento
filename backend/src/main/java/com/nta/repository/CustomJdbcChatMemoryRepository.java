package com.nta.repository;

import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.*;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@Primary
public class CustomJdbcChatMemoryRepository implements ChatMemoryRepository {

    private final JdbcTemplate jdbc;

    public CustomJdbcChatMemoryRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<String> findConversationIds() {
        return jdbc.queryForList(
                "SELECT DISTINCT conversation_id FROM spring_ai_chat_memory", String.class);
    }

    @Override
    public List<Message> findByConversationId(String conversationId) {
        String sql =
                """
			SELECT content, role FROM spring_ai_chat_memory
			WHERE conversation_id = ?
		""";

        return jdbc.query(
                sql,
                new Object[] {conversationId},
                (rs, rowNum) -> {
                    String content = rs.getString("content");
                    String role = rs.getString("role");

                    return switch (role.toLowerCase()) {
                        case "user" -> new UserMessage(content);
                        case "assistant" -> new AssistantMessage(content);
                        case "system" -> new SystemMessage(content);
                        default -> throw new IllegalArgumentException("Unknown role: " + role);
                    };
                });
    }

    @Override
    public void saveAll(String conversationId, List<Message> messages) {
        String sql =
                """
			INSERT INTO spring_ai_chat_memory (conversation_id, content, role, type, timestamp)
			VALUES (?, ?, ?, ?, ?)
		""";

        for (Message message : messages) {
            jdbc.update(
                    sql,
                    conversationId,
                    message.getText(),
                    message.getMessageType().name().toLowerCase(), // user, assistant, system
                    message.getClass().getSimpleName(),
                    java.time.Instant.now());
        }
    }

    @Override
    public void deleteByConversationId(String conversationId) {
        jdbc.update("DELETE FROM spring_ai_chat_memory WHERE conversation_id = ?", conversationId);
    }
}
