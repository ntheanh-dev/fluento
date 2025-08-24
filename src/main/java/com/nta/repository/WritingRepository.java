package com.nta.repository;

import com.nta.entity.Writing;

import org.springframework.data.jpa.repository.JpaRepository;

public interface WritingRepository extends JpaRepository<Writing, Long> {
    Writing findByConversationId(String conversationId);
}
