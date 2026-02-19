package com.nta.domain.user;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.user.dto.request.ChangePasswordRequest;
import com.nta.domain.user.dto.request.CreateApiKeyRequest;
import com.nta.domain.user.dto.request.PasswordCreationRequest;
import com.nta.domain.user.dto.response.ApiKeyResponse;
import com.nta.domain.user.dto.response.UserResponse;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController("userController")
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {

    Service service;

    @PostMapping("/create-password")
    ApiResponse<Void> createPassword(@RequestBody @Valid PasswordCreationRequest request) {
        service.createPassword(request);
        return ApiResponse.<Void>builder()
                .message("Password has been created, you could use it to log-in")
                .build();
    }

    @PutMapping("/change-password")
    ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        service.changePassword(request);
        return ApiResponse.<Void>builder()
                .message("Password has been changed successfully")
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder().result(service.getMyInfo()).build();
    }

    // API Key Management Endpoints
    @PostMapping("/api-key")
    ApiResponse<ApiKeyResponse> createApiKey(@RequestBody @Valid CreateApiKeyRequest request) {
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
