package com.nta.domain.userSentenceAnswer;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("userSentenceAnswerRepository")
public interface Repository extends JpaRepository<UserSentenceAnswer, Long> {}
