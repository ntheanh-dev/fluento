package com.nta.domain.userPractice;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("userPracticeRepository")
public interface Repository extends JpaRepository<UserPractice, Long> {}
