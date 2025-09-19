package com.nta.repository;

import com.nta.entity.UserApiKey;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserApiKeyRepository extends JpaRepository<UserApiKey, Long> {
    Optional<UserApiKey> findByUserId(Long userId);
    void deleteByUserId(Long userId);
}


