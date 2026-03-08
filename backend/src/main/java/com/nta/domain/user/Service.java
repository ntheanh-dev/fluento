package com.nta.domain.user;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
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
import com.nta.domain.user.dto.response.UserRankingResponse;
import com.nta.domain.user.dto.response.UserResponse;
import com.nta.domain.user.projection.UserRankingProjection;

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

    com.nta.domain.userSentenceAnswer.Repository userSentenceAnswerRepository;

    com.nta.domain.userPractice.Repository userPracticeRepository;

    CommonUserService commonUserService;

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

        if (embedded == null || embedded.isBlank()) {
            return userResponse;
        }

        List<String> flags =
                Arrays.stream(embedded.split(",")).map(String::trim).toList();

        UserMeEmbeddedResponse.UserMeEmbeddedResponseBuilder embeddedBuilder = UserMeEmbeddedResponse.builder();

        if (flags.contains("apiKey")) {
            embeddedBuilder.apiKey(apiKeyService.listMyKeysForUserId(user.getId()));
        }

        if (flags.contains("practiceStats")) {
            Object[] stats = userSentenceAnswerRepository.getUserSentenceAnswerStats(user.getId());
            if (stats != null && stats.length > 0) {
                Object[] row = (Object[]) stats[0];

                Long totalAnswers = row[0] instanceof Number ? ((Number) row[0]).longValue() : 0L;
                Double avgScore = row[1] instanceof Number ? ((Number) row[1]).doubleValue() : 0.0;

                embeddedBuilder.totalUserSentenceAnswers(totalAnswers).avgUserSentenceAnswerScore(avgScore);
            }
            Long totalLearningTime = userPracticeRepository.getTotalLearningTimeByUserId(user.getId());
            embeddedBuilder.totalLearningTime(totalLearningTime != null ? totalLearningTime : 0L);
        }

        userResponse.setEmbedded(embeddedBuilder.build());
        return userResponse;
    }

    public Page<UserRankingResponse> getRankings(int page, int size, String keyword) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<UserRankingProjection> rawPage = repository.findUserRankings(keyword, pageable);

        List<UserRankingResponse> content = new ArrayList<>();
        long startRank = (long) rawPage.getNumber() * rawPage.getSize() + 1;
        int index = 0;

        for (UserRankingProjection p : rawPage.getContent()) {
            long rank = startRank + index++;
            content.add(UserRankingResponse.builder()
                    .rank(rank)
                    .fullName(p.getFullName())
                    .urlAvatar(p.getUrlAvatar())
                    .avgScore(p.getAvgScore())
                    .totalUserSentenceAnswers(p.getTotalUserSentenceAnswers())
                    .currentStreak(p.getCurrentStreak())
                    .totalLearningTime(p.getTotalLearningTime())
                    .build());
        }

        return new PageImpl<>(content, rawPage.getPageable(), rawPage.getTotalElements());
    }
}
