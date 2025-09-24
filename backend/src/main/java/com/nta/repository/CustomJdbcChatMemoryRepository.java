package com.nta.repository;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.*;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.support.TransactionTemplate;

@Repository
@Slf4j
public class CustomJdbcChatMemoryRepository implements ChatMemoryRepository {

    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactionTemplate;

    public CustomJdbcChatMemoryRepository(JdbcTemplate jdbc, TransactionTemplate transactionTemplate) {
        this.jdbc = jdbc;
        this.transactionTemplate = transactionTemplate;
    }

    @Override
    public List<String> findConversationIds() {
        return jdbc.queryForList("SELECT DISTINCT conversation_id FROM spring_ai_chat_memory", String.class);
    }

    @Override
    public List<Message> findByConversationId(String conversationId) {
        String sql = """
			SELECT content, role FROM spring_ai_chat_memory
			WHERE conversation_id = ?
		""";

        return jdbc.query(sql, new Object[] {conversationId}, (rs, rowNum) -> {
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
        final String sql =
                """
			INSERT INTO spring_ai_chat_memory (conversation_id, content, role, type, timestamp)
			VALUES (?, ?, ?, ?, ?)
		""";


        this.transactionTemplate.execute((status) -> {
            this.deleteByConversationId(conversationId);
            this.jdbc.batchUpdate(sql, new AddBatchPreparedStatement(conversationId, messages));
            return null;
        });
    }

    @Override
    public void deleteByConversationId(String conversationId) {
        jdbc.update("DELETE FROM spring_ai_chat_memory WHERE conversation_id = ?", conversationId);
    }

    private static record AddBatchPreparedStatement(String conversationId, List<Message> messages, AtomicLong instantSeq) implements BatchPreparedStatementSetter {
        private AddBatchPreparedStatement(String conversationId, List<Message> messages) {
            this(conversationId, messages, new AtomicLong(Instant.now().toEpochMilli()));
        }

        private AddBatchPreparedStatement(String conversationId, List<Message> messages, AtomicLong instantSeq) {
            this.conversationId = conversationId;
            this.messages = messages;
            this.instantSeq = instantSeq;
        }

        public void setValues(PreparedStatement ps, int i) throws SQLException {
            Message message = (Message)this.messages.get(i);
            ps.setString(1, this.conversationId);
            ps.setString(2, message.getText());
            ps.setString(3, message.getMessageType().name());
            ps.setString(4, message.getClass().getSimpleName());
            ps.setTimestamp(5, new Timestamp(java.time.Instant.now().toEpochMilli()));
        }

        public int getBatchSize() {
            return this.messages.size();
        }

        public String conversationId() {
            return this.conversationId;
        }

        public List<Message> messages() {
            return this.messages;
        }

        public AtomicLong instantSeq() {
            return this.instantSeq;
        }
    }
}
