package com.nta.domain.user;

import java.io.IOException;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.cloudinary.CloudinaryFileUploadService;
import com.nta.domain.user.dto.request.CreateApiKeyRequest;
import com.nta.domain.user.dto.request.UpdateMeRequest;
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
    private final CloudinaryFileUploadService cloudinaryFileUploadService;

    /**
     * Update current user profile. Handles optional fullName, password change, and avatar upload.
     * Each field is applied only when provided.
     */
    @Transactional
    public UserResponse updateMe(UpdateMeRequest profile, MultipartFile avatar) {
        User user = this.getUserFromContext();

        // Case: profile (fullName, password)
        if (profile != null) {
            if (profile.getFullName() != null) {
                String trimmed = profile.getFullName().trim();
                user.setFullName(trimmed.isEmpty() ? null : trimmed);
            }
            if (StringUtils.hasText(profile.getNewPassword())) {
                final String currentPassword = profile.getCurrentPassword();
                final String storedPassword = user.getPassword();
                if (StringUtils.hasText(storedPassword)) {
                    if (!StringUtils.hasText(currentPassword)
                            || !passwordEncoder.matches(currentPassword, storedPassword)) {
                        throw new AppException(ErrorCode.CURRENT_PASSWORD_INVALID);
                    }
                }
                user.setPassword(passwordEncoder.encode(profile.getNewPassword()));
            }
        }

        // Case: avatar
        if (avatar != null && !avatar.isEmpty()) {
            try {
                if (StringUtils.hasText(user.getUrlAvatar())) {
                    cloudinaryFileUploadService.deleteFile(user.getUrlAvatar());
                }
                Map<String, Object> uploadResult = cloudinaryFileUploadService.uploadFile(avatar, "fluento/avatar");
                user.setUrlAvatar(uploadResult.get("url").toString());
            } catch (IOException e) {
                throw new AppException(ErrorCode.UPLOAD_FILE_ERROR);
            }
        }

        user = repository.save(user);
        log.info("Profile updated for user: {}", user.getUsername());

        UserResponse response = mapper.toUserResponse(user);
        response.setNoPassword(!StringUtils.hasText(user.getPassword()));
        return response;
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
        log.info("API key created for user: {}", user.getUsername());

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
        log.info("API key deleted for user: {}", user.getUsername());
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
        log.info("API key updated for user: {}", user.getUsername());

        return ApiKeyResponse.builder()
                .id(savedUser.getId())
                .apiKey(savedUser.getApiKey())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }
}
