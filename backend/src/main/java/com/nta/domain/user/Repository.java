package com.nta.domain.user;

import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import feign.Param;

@org.springframework.stereotype.Repository("userRepository")
public interface Repository extends JpaRepository<User, Long> {
    boolean existsByUsername(String username);

    Optional<User> findByUsername(String username);

    @Modifying
    @Query("UPDATE User u SET u.activeApiKeyId = :id WHERE u.id = :userId")
    void updateActiveApiKeyIdById(Long userId, Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from User u where u.id = :id")
    Optional<User> findByIdForUpdate(@Param("id") Long id);
}
