package com.nta.service;

import com.nta.dto.request.UpsertApiKeyRequest;
import com.nta.dto.response.UserApiKeyResponse;
import com.nta.entity.User;
import com.nta.entity.UserApiKey;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.repository.UserApiKeyRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserApiKeyService {

    UserApiKeyRepository userApiKeyRepository;
    UserService userService;

    public void upsertMyApiKey(UpsertApiKeyRequest request) {
        final User user = userService.getUserFromContext();

        final UserApiKey userApiKey = userApiKeyRepository.findByUserId(user.getId()).orElseGet(UserApiKey::new);
        userApiKey.setUser(user);
        userApiKey.setProvider(request.getProvider());
        userApiKey.setApiKey(request.getApiKey());
        userApiKey.setUpdatedAt(Instant.now());
        userApiKeyRepository.save(userApiKey);
    }

    public void deleteMyApiKey() {
        final User user = userService.getUserFromContext();
        userApiKeyRepository.deleteByUserId(user.getId());
    }

    public UserApiKeyResponse getMyApiKeyInfo() {
        final User user = userService.getUserFromContext();
        return userApiKeyRepository
                .findByUserId(user.getId())
                .map(k -> UserApiKeyResponse.builder().provider(k.getProvider()).present(true).build())
                .orElse(UserApiKeyResponse.builder().present(false).build());
    }

    public String getRequiredApiKey() {
        final User user = userService.getUserFromContext();
        final UserApiKey key =
                userApiKeyRepository
                        .findByUserId(user.getId()).orElse(null);
        return key != null ? key.getApiKey() : null;
    }
}


