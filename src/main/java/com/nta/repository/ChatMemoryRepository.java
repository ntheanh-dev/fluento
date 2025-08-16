package com.nta.repository;

import com.nta.entity.ChatMemory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChatMemoryRepository extends JpaRepository<ChatMemory, Long> {
}
