package com.nta.service;

import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.nta.dto.request.PasswordCreationRequest;
import com.nta.dto.request.ChangePasswordRequest;
import com.nta.dto.request.CreateApiKeyRequest;
import com.nta.dto.response.UserResponse;
import com.nta.dto.response.ApiKeyResponse;
import com.nta.entity.User;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.mapper.UserMapper;
import com.nta.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    public void createPassword(final PasswordCreationRequest passwordCreationRequest) {
        final User user = this.getUserFromContext();

        if (StringUtils.hasText(user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_EXISTED);
        }

        final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        user.setPassword(passwordEncoder.encode(passwordCreationRequest.getPassword()));
        userRepository.save(user);
    }

    public void changePassword(final ChangePasswordRequest changePasswordRequest) {
        final User user = this.getUserFromContext();
        final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        // Check if user has a password
        if (!StringUtils.hasText(user.getPassword())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        // Verify current password
        boolean isCurrentPasswordValid = passwordEncoder.matches(
            changePasswordRequest.getCurrentPassword(), 
            user.getPassword()
        );
        
        if (!isCurrentPasswordValid) {
            throw new AppException(ErrorCode.INCORRECT_PASSWORD);
        }

        // Set new password
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    public UserResponse getMyInfo() {
        final User user = this.getUserFromContext();

        final UserResponse userResponse = userMapper.toUserResponse(user);
        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));

        return userResponse;
    }

    public User getUserFromContext() {
        final var context = SecurityContextHolder.getContext();
        final String name = context.getAuthentication().getName();

        return userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public String getApiKeyFromContext() {
        // currently use api key from env variable for all users
//        final var context = SecurityContextHolder.getContext();
//        final String name = context.getAuthentication().getName();
//
//        return userRepository.findApiKeyByUsername(name).orElseThrow(() -> new AppException(ErrorCode.AI_API_KEY_MISSING));
        return "";
    }

    // API Key Management Methods
    @Transactional
    public ApiKeyResponse createApiKey(CreateApiKeyRequest request) {
        final User user = this.getUserFromContext();
        
        // Check if API key already exists for any user
        if (userRepository.findByApiKey(request.getApiKey()).isPresent()) {
            throw new AppException(ErrorCode.API_KEY_EXISTED);
        }

        user.setApiKey(request.getApiKey());
        User savedUser = userRepository.save(user);

        return ApiKeyResponse.builder()
                .id(savedUser.getId())
                .apiKey(savedUser.getApiKey())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteApiKey() {
        final User user = this.getUserFromContext();
        
        user.setApiKey(null);
        userRepository.save(user);
    }

    @Transactional
    public ApiKeyResponse updateApiKey(CreateApiKeyRequest request) {
        final User user = this.getUserFromContext();
        
        // Check if API key already exists for any other user
        Optional<User> existingUser = userRepository.findByApiKey(request.getApiKey());
        if (existingUser.isPresent() && !existingUser.get().getId().equals(user.getId())) {
            throw new AppException(ErrorCode.API_KEY_EXISTED);
        }

        user.setApiKey(request.getApiKey());
        User savedUser = userRepository.save(user);

        return ApiKeyResponse.builder()
                .id(savedUser.getId())
                .apiKey(savedUser.getApiKey())
                .createdAt(savedUser.getCreatedAt())
                .build();
    }
}
