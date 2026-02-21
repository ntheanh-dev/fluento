package com.nta.domain.apikey;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.ApiKeyCrypto;
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
    com.nta.domain.user.Service userService;
    com.nta.domain.user.Repository userRepository;

    public Service(
            Repository repository,
            Mapper mapper,
            ApiKeyCrypto apiKeyCrypto,
            @Lazy com.nta.domain.user.Service userService,
            com.nta.domain.user.Repository userRepository) {
        this.repository = repository;
        this.mapper = mapper;
        this.apiKeyCrypto = apiKeyCrypto;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    public List<AiModelResponse> listMyKeysForUserId(Long userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(mapper::toAiModelResponse)
                .toList();
    }

    @Transactional
    public List<AiModelResponse> create(CreateApiKeyRequest request) {
        User user = userService.getUserFromContext();
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
                    .limitPerDay(LimitPerDay.STANDARD)
                    .build();
            row = repository.save(row);
            if (isFirstKey) {
                user.setActiveApiKeyId(row.getId());
                userRepository.save(user);
                isFirstKey = false;
            }
            created.add(row);
        }
        log.info("API key created for user: {} with {} rows", user.getUsername(), created.size());
        return created.stream().map(mapper::toAiModelResponse).toList();
    }

    @Transactional
    public void delete(DeleteApiKeyRequest request) {
        User user = userService.getUserFromContext();
        deleteByApiKeyForUserId(request.getApiKey(), user.getId());
    }

    @Transactional
    public void deleteByApiKeyForUserId(String apiKey, Long userId) {
        String encrypted = apiKeyCrypto.encrypt(apiKey);
        List<ApiKey> group = repository.findByApiKeyAndUserId(encrypted, userId);
        if (group.isEmpty()) {
            throw new AppException(ErrorCode.PROVIDER_API_KEY_NOT_FOUND);
        }
        User user = group.get(0).getUser();
        if (user.getActiveApiKeyId() != null
                && group.stream().anyMatch(r -> r.getId().equals(user.getActiveApiKeyId()))) {
            user.setActiveApiKeyId(null);
            userRepository.save(user);
        }
        repository.deleteAll(group);
        log.info("API key deleted for user {}: {} rows", userId, group.size());
    }
}
