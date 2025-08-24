package com.nta.repository;

import com.nta.entity.SentenceCount;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SentenceCountRepository extends JpaRepository<SentenceCount, Long> {}
