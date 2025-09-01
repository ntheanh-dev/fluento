package com.nta.repository;

import com.nta.entity.Tone;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ToneRepository extends JpaRepository<Tone, Long> {
    Optional<Tone> findByName(String name);
}


