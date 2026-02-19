package com.nta.domain.user;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

@org.springframework.stereotype.Repository("userRepository")
public interface Repository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    Optional<User> findByApiKey(String apiKey);

    @Query("SELECT u.apiKey FROM User u WHERE u.username = :username")
    Optional<String> findApiKeyByUsername(String username);
}
