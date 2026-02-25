package com.nta.domain.userPractice;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("userPracticeRepository")
public interface Repository extends JpaRepository<UserPractice, Long> {
    Optional<UserPractice> findByIdAndUserId(Long id, Long userId);

    List<UserPractice> findByUserId(Long userId);
}
