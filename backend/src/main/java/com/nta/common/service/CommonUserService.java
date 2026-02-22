package com.nta.common.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.apikey.ApiKey;
import com.nta.domain.user.Repository;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("commonUserService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommonUserService {
    Repository repository;
    ApiKeyCrypto apiKeyCrypto;
    com.nta.domain.apikey.Repository apiKeyRepository;

    public Long getCurrentUserIdFromContext() {
        var authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Jwt principal = (Jwt) authentication.getPrincipal();
        Object userId = principal.getClaims().get("user_id");
        if (userId == null) {
            log.error("User ID claim is missing in JWT token");
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        return Long.parseLong(userId.toString());
    }

    public User getUserFromContext() {
        Long userId = this.getCurrentUserIdFromContext();
        return repository.findById(userId).orElse(null);
    }

    public ApiKey getApiKeyFromContext() {
        Long userId = this.getCurrentUserIdFromContext();
        if (userId == null) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        var apiKey = apiKeyRepository.findActiveApiKeyByUserId(userId);
        if (apiKey == null) {
            log.error("API key not found for user ID: {}", userId);
            throw new AppException(ErrorCode.AI_API_KEY_MISSING_FOR_USER);
        }

        // verify api key is not reached limit
        if (apiKey.getRequestCountToday() >= apiKey.getLimitPerDay().getMaxRequests()) {
            log.warn("API key {} has reached its daily limit", apiKey.getApiKey());
            throw new AppException(ErrorCode.AI_API_KEY_REACHED_DAILY_LIMIT);
        }

        // encrypted api key is stored in database, we need to decrypt it before returning
        String decryptedApiKey = apiKeyCrypto.decrypt(apiKey.getApiKey());
        apiKey.setApiKey(decryptedApiKey);

        return apiKey;
    }
}
