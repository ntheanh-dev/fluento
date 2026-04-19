package com.nta.domain.user;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
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
import com.nta.domain.user.dto.request.ExchangeCoinsRequest;
import com.nta.domain.user.dto.request.UpdateMeRequest;
import com.nta.domain.user.dto.response.CreditBalanceResponse;
import com.nta.domain.user.dto.response.UserMeEmbeddedResponse;
import com.nta.domain.user.dto.response.UserRankingResponse;
import com.nta.domain.user.dto.response.UserResponse;
import com.nta.domain.user.projection.UserRankingProjection;

import io.sentry.Sentry;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("userService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class Service {

    /** Phải khớp gói đổi ở frontend (SubscriptionSection COIN_EXCHANGE_PACKS). */
    private static final Map<Integer, Integer> COIN_EXCHANGE_CREDITS = Map.of(10, 1, 20, 2, 50, 6, 100, 12);

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

    ZoneId appZoneId;

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
                Map<String, Object> uploadResult = cloudinaryFileUploadService.uploadFile(avatar, "luyenviet/avatar");
                user.setUrlAvatar(uploadResult.get("url").toString());
            } catch (IOException e) {
                Sentry.captureException(e);
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

    public CreditBalanceResponse getMyCredits() {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Integer credits = repository.findCreditsByUserId(userId);
        Integer coins = repository.findCoinsByUserId(userId);
        return CreditBalanceResponse.builder()
                .credits(credits != null ? credits : 0)
                .coins(coins != null ? coins : 0)
                .build();
    }

    /**
     * Đổi coin lấy credit: chỉ các gói cố định; trừ coin và cộng credit trong một câu UPDATE có điều kiện {@code coins >= cost}.
     */
    @Transactional
    public CreditBalanceResponse exchangeCoinsForCredits(ExchangeCoinsRequest request) {
        Integer cost = request.getCoins();
        Integer creditsGain = COIN_EXCHANGE_CREDITS.get(cost);
        if (creditsGain == null) {
            throw new AppException(ErrorCode.COIN_EXCHANGE_INVALID);
        }

        Long userId = commonUserService.getCurrentUserIdFromContext();
        int updated = repository.exchangeCoinsForCredits(userId, cost, creditsGain);
        if (updated == 0) {
            throw new AppException(ErrorCode.NOT_ENOUGH_COINS);
        }

        log.info("User {} exchanged {} coins for {} credits", userId, cost, creditsGain);
        return getMyCredits();
    }

    public UserResponse getMyInfo(String embedded) {
        final User user = commonUserService.getUserFromContext();

        // Kiểm tra và reset streak nếu đã đứt chuỗi (dựa trên lastSubmissionDate)
        LocalDate today = LocalDate.now(appZoneId);
        LocalDate lastDate = user.getLastSubmissionDate();
        Integer currentStreak = user.getCurrentStreak();

        boolean streakUpdated = false;

        if (lastDate == null) {
            if (currentStreak != null && currentStreak != 0) {
                user.setCurrentStreak(0);
                streakUpdated = true;
            }
        } else {
            LocalDate yesterday = today.minusDays(1);
            if (lastDate.isBefore(yesterday) && currentStreak != null && currentStreak != 0) {
                user.setCurrentStreak(0);
                streakUpdated = true;
                log.info("Streak reset for user: {}", user.getUsername());
            }
        }

        if (streakUpdated) {
            repository.save(user);
        }

        final UserResponse userResponse = mapper.toUserResponse(user);
        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));

        if (embedded == null || embedded.isBlank()) {
            return userResponse;
        }

        List<String> flags =
                Arrays.stream(embedded.split(",")).map(String::trim).toList();

        UserMeEmbeddedResponse.UserMeEmbeddedResponseBuilder embeddedBuilder = UserMeEmbeddedResponse.builder();

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
