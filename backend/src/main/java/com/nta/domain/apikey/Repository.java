package com.nta.domain.apikey;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@org.springframework.stereotype.Repository("apiKeyRepository")
public interface Repository extends JpaRepository<ApiKey, Long> {

    @Query("SELECT a FROM ApiKey a WHERE a.user.id = :userId ORDER BY a.createdAt ASC")
    List<ApiKey> findByUserIdOrderByCreatedAtAsc(@Param("userId") Long userId);

    @Query("SELECT a FROM ApiKey a WHERE a.user.id = :userId AND a.isActive = true AND a.id <> :excludeId")
    List<ApiKey> findActiveByUserIdAndId(@Param("userId") Long userId, @Param("excludeId") Long excludeId);

    @Query("SELECT a FROM ApiKey a WHERE a.user.id = :userId AND a.isActive = true AND a.apiKey <> :excludeKey")
    List<ApiKey> findActiveByUserIdAndKey(@Param("userId") Long userId, @Param("excludeKey") String excludeKey);

    @Query("SELECT CASE WHEN COUNT(a) > 0 THEN true ELSE false END FROM ApiKey a WHERE a.apiKey = :apiKey")
    boolean existsByApiKey(@Param("apiKey") String apiKey);

    @Query("SELECT a FROM ApiKey a WHERE a.apiKey = :apiKey AND a.user.id = :userId")
    List<ApiKey> findByApiKeyAndUserId(@Param("apiKey") String apiKey, @Param("userId") Long userId);

    @Query("SELECT ak FROM User u JOIN ApiKey ak ON ak.id = u.activeApiKeyId WHERE ak.user.id = :userId")
    ApiKey findActiveApiKeyByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("UPDATE ApiKey a SET a.isActive = false WHERE a.id = :id")
    void deactivateApiKey(@Param("id") Long id);
}
