package com.nta.domain.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("userRepository")
public interface Repository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);
}
