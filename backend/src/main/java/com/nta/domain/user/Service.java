package com.nta.domain.user;

import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.user.dto.request.ChangePasswordRequest;
import com.nta.domain.user.dto.request.CreateApiKeyRequest;
import com.nta.domain.user.dto.request.PasswordCreationRequest;
import com.nta.domain.user.dto.response.ApiKeyResponse;
import com.nta.domain.user.dto.response.UserResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("userService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class Service {
    Repository repository;
    Mapper mapper;
    PasswordEncoder passwordEncoder;

    public void createPassword(final PasswordCreationRequest passwordCreationRequest) {
        final User user = this.getUserFromContext();

        if (StringUtils.hasText(user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_EXISTED);
        }

        user.setPassword(passwordEncoder.encode(passwordCreationRequest.getPassword()));
        repository.save(user);
    }

    public void changePassword(final ChangePasswordRequest changePasswordRequest) {
        final User user = this.getUserFromContext();

        // Check if user has a password
        if (!StringUtils.hasText(user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Verify current password
        boolean isCurrentPasswordValid =
                passwordEncoder.matches(changePasswordRequest.getCurrentPassword(), user.getPassword());

        if (!isCurrentPasswordValid) {
            throw new AppException(ErrorCode.INCORRECT_PASSWORD);
        }

        // Set new password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        repository.save(user);
    }

    public UserResponse getMyInfo() {
        final User user = this.getUserFromContext();

        final UserResponse userResponse = mapper.toUserResponse(user);
        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));

        return userResponse;
    }

    public User getUserFromContext() {
        final var context = SecurityContextHolder.getContext();
        final String name = context.getAuthentication().getName();

        return repository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public String getApiKeyFromContext() {
        // currently use api key from env variable for all users
        //        final var context = SecurityContextHolder.getContext();
        //        final String name = context.getAuthentication().getName();
        //
        //        return repository.findApiKeyByUsername(name).orElseThrow(() -> new
        // AppException(ErrorCode.AI_API_KEY_MISSING));
        return "";
    }

    // API Key Management Methods
    @Transactional
    public ApiKeyResponse createApiKey(CreateApiKeyRequest request) {
        final User user = this.getUserFromContext();

        // Check if API key already exists for any user
        if (repository.findByApiKey(request.getApiKey()).isPresent()) {
            throw new AppException(ErrorCode.API_KEY_EXISTED);
        }

        user.setApiKey(request.getApiKey());
        User savedUser = repository.save(user);

        return ApiKeyResponse.builder()
                .id(savedUser.getId())
                .apiKey(savedUser.getApiKey())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteApiKey() {
        final User user = this.getUserFromContext();

        user.setApiKey(null);
        repository.save(user);
    }

    @Transactional
    public ApiKeyResponse updateApiKey(CreateApiKeyRequest request) {
        final User user = this.getUserFromContext();

        // Check if API key already exists for any other user
        Optional<User> existingUser = repository.findByApiKey(request.getApiKey());
        if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.API_KEY_EXISTED);
        }

        user.setApiKey(request.getApiKey());
        User savedUser = repository.save(user);

        return ApiKeyResponse.builder()
                .id(savedUser.getId())
                .apiKey(savedUser.getApiKey())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }
}
