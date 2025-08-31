package com.nta.controller;

import com.nta.dto.request.PasswordCreationRequest;
import com.nta.dto.response.ApiResponse;

import com.nta.dto.response.UserResponse;
import com.nta.service.UserService;
import jakarta.validation.Valid;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/my-info")
    ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder().result(userService.getMyInfo()).build();
    }
}
