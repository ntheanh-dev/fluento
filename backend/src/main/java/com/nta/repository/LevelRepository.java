package com.nta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.nta.entity.Level;

@Repository
public interface LevelRepository extends JpaRepository<Level, Long> {
    Optional<Level> findByName(final String name);
}
