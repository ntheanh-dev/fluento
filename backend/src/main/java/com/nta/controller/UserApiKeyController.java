package com.nta.controller;

import com.nta.dto.request.UpsertApiKeyRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.UserApiKeyResponse;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.service.AIChatService;
import com.nta.service.UserApiKeyService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/ai/keys")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserApiKeyController {

    UserApiKeyService userApiKeyService;
    AIChatService aiChatService;
    @PostMapping
    public ResponseEntity<ApiResponse<Void>> upsert(@Valid @RequestBody UpsertApiKeyRequest request) {

        final String key = request.getApiKey();
        if (!aiChatService.isApiKeyValid(key)) {
            throw new AppException(ErrorCode.AI_API_KEY_INVALID);
        }

        userApiKeyService.upsertMyApiKey(request);
        return ResponseEntity.ok(ApiResponse.<Void>builder().message("OK").build());
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> delete() {
        userApiKeyService.deleteMyApiKey();
        return ResponseEntity.ok(ApiResponse.<Void>builder().message("OK").build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<UserApiKeyResponse>> get() {
        final var body = userApiKeyService.getMyApiKeyInfo();
        return ResponseEntity.ok(ApiResponse.<UserApiKeyResponse>builder().result(body).build());
    }
}


