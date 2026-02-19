package com.nta.domain.sentence;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("sentenceRepository")
public interface Repository extends JpaRepository<Sentence, Integer> {}
