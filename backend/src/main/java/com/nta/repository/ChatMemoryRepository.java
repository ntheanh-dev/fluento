package com.nta.repository;

import com.nta.entity.ChatMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMemoryRepository extends JpaRepository<ChatMemory, Long> {
    @Query(value = "SELECT * FROM spring_ai_chat_memory c " +
            "WHERE c.conversation_id = :conversationId " +
            "AND c.type = :type " +
            "ORDER BY c.timestamp ASC " +
            "LIMIT 1",
            nativeQuery = true)
    ChatMemory findFirstAssistantMessage(@Param("conversationId") String conversationId,
                                         @Param("type") String type);

}
