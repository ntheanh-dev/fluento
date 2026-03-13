package com.nta.domain.apikey;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.ApiKeyCrypto;
import com.nta.common.service.CommonUserService;
import com.nta.domain.apikey.dto.request.CreateApiKeyRequest;
import com.nta.domain.apikey.dto.request.DeleteApiKeyRequest;
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
    private final CommonUserService commonUserService;

    public Service(
            Repository repository,
            Mapper mapper,
            ApiKeyCrypto apiKeyCrypto,
            @Lazy com.nta.domain.user.Service userService,
            com.nta.domain.user.Repository userRepository,
            CommonUserService commonUserService) {
        this.repository = repository;
        this.mapper = mapper;
        this.apiKeyCrypto = apiKeyCrypto;
        this.userRepository = userRepository;
        this.commonUserService = commonUserService;
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

    @Transactional
    public List<AiModelResponse> create(CreateApiKeyRequest request) {
        User user = commonUserService.getUserFromContext();
        String encrypted = apiKeyCrypto.encrypt(request.getApiKey());
        if (repository.existsByApiKey(encrypted)) {
            throw new AppException(ErrorCode.API_KEY_EXISTED);
        }
        boolean isFirstKey = user.getActiveApiKeyId() == null;
        List<ApiKey> created = new ArrayList<>();
        for (AiModelName modelName : AiModelName.values()) {
            ApiKey row = ApiKey.builder()
                    .user(user)
                    .apiKey(encrypted)
                    .model(modelName)
                    .limitPerDay(LimitPerDay.FREE)
                    .isActive(true)
                    .createdAt(LocalDateTime.now())
                    .build();
            row = repository.save(row);
            if (isFirstKey) {
                user.setActiveApiKeyId(row.getId());
                userRepository.save(user);
                isFirstKey = false;
            }
            created.add(row);
        }
        long bonusCredits = 20L * created.size();
        userRepository.addCredits(user.getId(), bonusCredits);
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
        userRepository.findById(userId).ifPresent(user -> {
            user.setActiveApiKeyId(newActiveId);
            userRepository.save(user);
            log.info(
                    "User {} activeApiKeyId updated to {}",
                    userId,
                    newActiveId != null ? newActiveId : "null (no other active key)");
        });
    }

    @Transactional
    public void delete(DeleteApiKeyRequest request) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        List<ApiKey> group = repository.findByApiKeyAndUserId(request.getApiKey(), userId);
        if (group.isEmpty()) {
            throw new AppException(ErrorCode.PROVIDER_API_KEY_NOT_FOUND);
        }

        List<ApiKey> activeKeys = repository.findActiveByUserIdAndKey(userId, request.getApiKey());
        Long newActiveId = activeKeys.isEmpty() ? null : activeKeys.getFirst().getId();
        userRepository.updateActiveApiKeyIdById(userId, newActiveId);

        repository.deleteAll(group);
        log.info("API key deleted for user {}: {} rows", userId, group.size());
    }
}
