package com.nta.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.nta.dto.request.PasswordCreationRequest;
import com.nta.dto.request.ChangePasswordRequest;
import com.nta.dto.request.CreateApiKeyRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.UserResponse;
import com.nta.dto.response.ApiKeyResponse;
import com.nta.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {

    UserService userService;

    @PostMapping("/create-password")
    ApiResponse<Void> createPassword(@RequestBody @Valid PasswordCreationRequest request) {
        userService.createPassword(request);
        return ApiResponse.<Void>builder()
                .message("Password has been created, you could use it to log-in")
                .build();
    }

    @PutMapping("/change-password")
    ApiResponse<Void> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        userService.changePassword(request);
        return ApiResponse.<Void>builder()
                .message("Password has been changed successfully")
                .build();
    }

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    // API Key Management Endpoints
    @PostMapping("/api-key")
    ApiResponse<ApiKeyResponse> createApiKey(@RequestBody @Valid CreateApiKeyRequest request) {
        return ApiResponse.<ApiKeyResponse>builder()
                .result(userService.createApiKey(request))
                .message("API key created successfully")
                .build();
    }

    @PutMapping("/api-key")
    ApiResponse<ApiKeyResponse> updateApiKey(@RequestBody @Valid CreateApiKeyRequest request) {
        return ApiResponse.<ApiKeyResponse>builder()
                .result(userService.updateApiKey(request))
                .message("API key updated successfully")
                .build();
    }

    @DeleteMapping("/api-key")
    ApiResponse<Void> deleteApiKey() {
        userService.deleteApiKey();
        return ApiResponse.<Void>builder()
                .message("API key deleted successfully")
                .build();
    }
}
