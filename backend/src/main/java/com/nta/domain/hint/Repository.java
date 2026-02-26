package com.nta.domain.hint;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("hintRepository")
public interface Repository extends JpaRepository<Hint, Long> {
    Optional<Hint> findByParagraphIdAndOrderIndex(Long paragraphId, Integer orderIndex);
}
