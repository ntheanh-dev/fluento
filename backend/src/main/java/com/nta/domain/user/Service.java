package com.nta.domain.user;

import java.io.IOException;
import java.util.Map;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.cloudinary.CloudinaryFileUploadService;
import com.nta.domain.user.dto.request.UpdateMeRequest;
import com.nta.domain.user.dto.response.UserMeEmbeddedResponse;
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
    CloudinaryFileUploadService cloudinaryFileUploadService;
    com.nta.domain.apikey.Repository apiKeyRepository;

    @org.springframework.context.annotation.Lazy
    com.nta.domain.apikey.Service apiKeyService;

    private final CommonUserService commonUserService;

    /**
     * Update current user profile. Handles optional fullName, password change, and avatar upload.
     * Each field is applied only when provided.
     */
    @Transactional
    public UserResponse updateMe(UpdateMeRequest profile, MultipartFile avatar) {
        User user = commonUserService.getUserFromContext();

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
            String contentType = avatar.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new AppException(ErrorCode.AVATAR_FILE_TYPE_INVALID);
            }
            long maxAvatarSize = 5L * 1024 * 1024; // 5MB
            if (avatar.getSize() > maxAvatarSize) {
                throw new AppException(ErrorCode.AVATAR_FILE_SIZE_INVALID);
            }
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

        // Case: update activeApiKey
        if (profile != null && profile.getActiveApiKeyId() != null) {
            var apiKey = apiKeyRepository.findById(profile.getActiveApiKeyId()).orElse(null);
            if (apiKey == null || !apiKey.getUser().getId().equals(user.getId())) {
                throw new AppException(ErrorCode.AI_MODEL_NOT_FOUND);
            }
            user.setActiveApiKeyId(apiKey.getId());
        }

        user = repository.save(user);
        log.info("Profile updated for user: {}", user.getUsername());

        UserResponse response = mapper.toUserResponse(user);
        response.setNoPassword(!StringUtils.hasText(user.getPassword()));
        return response;
    }

    public UserResponse getMyInfo(String embedded) {
        final User user = commonUserService.getUserFromContext();

        final UserResponse userResponse = mapper.toUserResponse(user);
        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));

        if (embedded != null
                && java.util.Arrays.stream(embedded.split(","))
                        .map(String::trim)
                        .anyMatch("apiKey"::equals)) {
            userResponse.setEmbedded(UserMeEmbeddedResponse.builder()
                    .apiKey(apiKeyService.listMyKeysForUserId(user.getId()))
                    .build());
        }
        return userResponse;
    }
}
