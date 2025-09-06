package com.nta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nta.entity.Tone;

@Repository
public interface ToneRepository extends JpaRepository<Tone, Long> {
    Optional<Tone> findByName(String name);
}
