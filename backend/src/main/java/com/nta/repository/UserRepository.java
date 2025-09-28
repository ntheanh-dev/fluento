package com.nta.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.nta.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);
    
    Optional<User> findByApiKey(String apiKey);

    @Query("SELECT u.apiKey FROM User u WHERE u.username = :username")
    Optional<String> findApiKeyByUsername(String username);
}
