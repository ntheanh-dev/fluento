package com.nta.domain.apikey;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import com.nta.common.client.GeminiApiClient;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.ApiKeyCrypto;
import com.nta.common.service.CommonUserService;
import com.nta.domain.apikey.dto.request.CreateApiKeyRequest;
import com.nta.domain.apikey.dto.response.AiModelResponse;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("apiKeyService")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class Service {
    Repository repository;
    Mapper mapper;
    ApiKeyCrypto apiKeyCrypto;
    com.nta.domain.user.Repository userRepository;
    CommonUserService commonUserService;
    GeminiApiClient geminiApiClient;

    public Service(
            Repository repository,
            Mapper mapper,
            ApiKeyCrypto apiKeyCrypto,
            @Lazy com.nta.domain.user.Service userService,
            com.nta.domain.user.Repository userRepository,
            CommonUserService commonUserService,
            GeminiApiClient geminiApiClient) {
        this.repository = repository;
        this.mapper = mapper;
        this.apiKeyCrypto = apiKeyCrypto;
        this.userRepository = userRepository;
        this.commonUserService = commonUserService;
        this.geminiApiClient = geminiApiClient;
    }

    public List<AiModelResponse> listMyKeys() {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        return listMyKeysForUserId(userId);
    }

    public List<AiModelResponse> listMyKeysForUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtAsc(userId).stream()
                .map(mapper::toAiModelResponse)
                .toList();
    }

    /**
     * Kiểm tra API key hợp lệ bằng cách gọi Gemini list models.
     */
    private void validateGeminiApiKey(String apiKey) {
        try {
            geminiApiClient.listModels(apiKey != null ? apiKey.trim() : "");
        } catch (feign.FeignException e) {
            log.warn("Gemini API key validation failed: status={}", e.status(), e);
            throw new AppException(ErrorCode.AI_API_KEY_INVALID);
        }
    }

    /**
     * Trừ credit của api key row (atomic). Ném nếu không đủ credit.
     */
    @Transactional
    public void deductCredit(Long apiKeyId, int amount) {
        if (amount <= 0) return;
        int updated = repository.deductCredit(apiKeyId, amount);
        if (updated == 0) {
            throw new AppException(ErrorCode.THIS_MODEL_NOT_ENOUGH_CREDITS);
        }
    }

    /**
     * Hoàn credit lại cho api key row (khi gọi AI thất bại).
     */
    @Transactional
    public void refundCredit(Long apiKeyId, int amount) {
        if (amount <= 0) return;
        repository.addCredit(apiKeyId, amount);
    }

    @Transactional
    public List<AiModelResponse> create(CreateApiKeyRequest request) {
        String plainKey = request.getApiKey();
        validateGeminiApiKey(plainKey);

        User user = commonUserService.getUserFromContext();
        String encrypted = apiKeyCrypto.encrypt(plainKey);
        List<ApiKey> existing = repository.findByApiKey(encrypted);

        if (!existing.isEmpty()) {
            // Reject if any row is still owned (by me or another user)
            boolean anyOwned = existing.stream().anyMatch(a -> a.getUser() != null);
            if (anyOwned) {
                throw new AppException(ErrorCode.API_KEY_EXISTED);
            }
            // Orphaned rows (user_id = null): reattach to current user; cộng tổng credit có trong nhóm vào user
            int totalCreditInGroup = existing.stream()
                    .mapToInt(row -> row.getCredit() != null ? row.getCredit() : 0)
                    .sum();
            for (ApiKey row : existing) {
                row.setUser(user);
                row.setActive(true);
                repository.save(row);
            }
            Long userId = user.getId();
            if (user.getActiveApiKeyId() == null) {
                userRepository.updateActiveApiKeyIdById(
                        userId, existing.getFirst().getId());
            }
            repository.flush();
            if (totalCreditInGroup > 0) {
                userRepository.addCredits(userId, totalCreditInGroup);
            }
            log.info(
                    "API key re-attached for user: {} with {} rows, {} credits in group added to user",
                    user.getUsername(),
                    existing.size(),
                    totalCreditInGroup);
            return existing.stream().map(mapper::toAiModelResponse).toList();
        }

        // New key: create one row per model (20 credit each), set default if first, add user bonus
        List<ApiKey> created = new ArrayList<>();
        for (AiModelName modelName : AiModelName.values()) {
            ApiKey row = ApiKey.builder()
                    .user(user)
                    .apiKey(encrypted)
                    .model(modelName)
                    .credit(20)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            created.add(repository.save(row));
        }
        Long userId = user.getId();
        if (user.getActiveApiKeyId() == null) {
            userRepository.updateActiveApiKeyIdById(userId, created.getFirst().getId());
        }
        repository.flush();
        int bonusCredits = 20 * created.size();
        userRepository.addCredits(userId, bonusCredits);
        log.info(
                "API key created for user: {} with {} rows, added {} bonus credits",
                user.getUsername(),
                created.size(),
                bonusCredits);
        return created.stream().map(mapper::toAiModelResponse).toList();
    }

    @Transactional
    public void switchActiveKeyAfterDeactivate(Long userId, Long deactivatedApiKeyId) {
        repository.deactivateApiKey(deactivatedApiKeyId);
        var otherActive = repository.findActiveByUserIdAndId(userId, deactivatedApiKeyId);
        Long newActiveId = otherActive.isEmpty() ? null : otherActive.getFirst().getId();
        userRepository.updateActiveApiKeyIdById(userId, newActiveId);
        log.info(
                "User {} activeApiKeyId updated to {}",
                userId,
                newActiveId != null ? newActiveId : "null (no other active key)");
    }

    /**
     * Xóa (detach) cả nhóm API key theo một id bất kỳ trong nhóm.
     * Một request xóa toàn bộ 3 row (3 model) cùng key; trừ tổng credit nhóm khỏi user một lần.
     */
    @Transactional
    public void delete(Long id) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        ApiKey one = repository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.PROVIDER_API_KEY_NOT_FOUND));

        String apiKeyValue = one.getApiKey();
        List<ApiKey> group = repository.findByApiKeyAndUserId(apiKeyValue, userId);

        int totalCredit = group.stream()
                .mapToInt(row -> row.getCredit() != null ? row.getCredit() : 0)
                .sum();
        if (totalCredit > 0) {
            userRepository.subtractCredits(userId, totalCredit);
        }

        Long activeApiKeyId = commonUserService.getUserFromContext().getActiveApiKeyId();
        boolean activeWasInGroup = activeApiKeyId != null
                && group.stream().anyMatch(row -> row.getId().equals(activeApiKeyId));
        if (activeWasInGroup) {
            List<ApiKey> otherActive = repository.findActiveByUserIdAndKey(userId, apiKeyValue);
            Long newActiveId =
                    otherActive.isEmpty() ? null : otherActive.getFirst().getId();
            userRepository.updateActiveApiKeyIdById(userId, newActiveId);
        }

        for (ApiKey row : group) {
            row.setCredit(0);
            row.setUser(null);
            row.setActive(false);
            repository.save(row);
        }
        log.info(
                "API key group detached for user {}: {} rows, {} credits subtracted",
                userId,
                group.size(),
                totalCredit);
    }
}
