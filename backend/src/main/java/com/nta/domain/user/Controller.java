package com.nta.domain.user;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.user.dto.request.*;
import com.nta.domain.user.dto.response.ApiKeyResponse;
import com.nta.domain.user.dto.response.UserResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("userController")
@RequestMapping("/users")
@Tag(name = "User", description = "User management APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {

    Service service;

    @GetMapping("/me")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder().result(service.getMyInfo()).build();
    }

    @PutMapping(
            value = "/me",
            consumes = {MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_JSON_VALUE})
    ApiResponse<UserResponse> updateMe(
            @RequestPart(value = "profile", required = false) @Valid UpdateMeRequest profile,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar) {
        log.debug("Update me requested");
        boolean hasProfileUpdate = profile != null
                && (StringUtils.hasText(profile.getFullName()) || StringUtils.hasText(profile.getNewPassword()));
        boolean hasAvatar = avatar != null && !avatar.isEmpty();
        if (!hasProfileUpdate && !hasAvatar) {
            throw new AppException(ErrorCode.UPDATE_ME_EMPTY);
        }
        return ApiResponse.<UserResponse>builder()
                .result(service.updateMe(profile, avatar))
                .message("Profile updated successfully")
                .build();
    }

    // API Key Management Endpoints
    @PostMapping("/api-key")
    ApiResponse<ApiKeyResponse> createApiKey(@RequestBody @Valid CreateApiKeyRequest request) {
        log.debug("Create API key requested");
        return ApiResponse.<ApiKeyResponse>builder()
                .result(service.createApiKey(request))
                .message("API key created successfully")
                .build();
    }

    @PutMapping("/api-key")
    ApiResponse<ApiKeyResponse> updateApiKey(@RequestBody @Valid CreateApiKeyRequest request) {
        return ApiResponse.<ApiKeyResponse>builder()
                .result(service.updateApiKey(request))
                .message("API key updated successfully")
                .build();
    }

    @DeleteMapping("/api-key")
    ApiResponse<Void> deleteApiKey() {
        service.deleteApiKey();
        return ApiResponse.<Void>builder()
                .message("API key deleted successfully")
                .build();
    }
}
