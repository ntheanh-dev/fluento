package com.nta.common.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
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
        return repository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
    }
}
