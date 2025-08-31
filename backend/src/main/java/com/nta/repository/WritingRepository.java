package com.nta.repository;

import com.nta.entity.Writing;

import feign.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface WritingRepository extends JpaRepository<Writing, Long> {
    Writing findByConversationId(String conversationId);

    @Query(
            "SELECT w FROM Writing w JOIN w.topic t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Writing> searchByTopicName(@Param("keyword") String keyword, Pageable pageable);
}
