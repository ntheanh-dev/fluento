package com.nta.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nta.entity.Sentence;

@Repository
public interface SentenceRepository extends JpaRepository<Sentence, Integer> {}
