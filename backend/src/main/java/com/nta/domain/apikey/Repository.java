package com.nta.domain.apikey;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@org.springframework.stereotype.Repository("apiKeyRepository")
public interface Repository extends JpaRepository<ApiKey, Long> {

    @Query("SELECT a FROM ApiKey a WHERE a.user.id = :userId ORDER BY a.createdAt DESC, a.id DESC")
    List<ApiKey> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM ApiKey a WHERE a.apiKey = :apiKey")
    boolean existsByApiKey(@Param("apiKey") String apiKey);

    @Query("SELECT a FROM ApiKey a WHERE a.apiKey = :apiKey AND a.user.id = :userId")
    List<ApiKey> findByApiKeyAndUserId(@Param("apiKey") String apiKey, @Param("userId") Long userId);
}
