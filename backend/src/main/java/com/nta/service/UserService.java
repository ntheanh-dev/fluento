package com.nta.service;

import com.nta.dto.request.PasswordCreationRequest;
import com.nta.dto.response.UserResponse;
import com.nta.entity.User;
import com.nta.entity.UserApiKey;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.mapper.UserMapper;
import com.nta.repository.UserApiKeyRepository;
import com.nta.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    UserApiKeyRepository userApiKeyRepository;
    public void createPassword(final PasswordCreationRequest passwordCreationRequest) {
        final User user = this.getUserFromContext();

        if (StringUtils.hasText(user.getPassword())) {
            throw new AppException(ErrorCode.PASSWORD_EXISTED);
        }

        final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        user.setPassword(passwordEncoder.encode(passwordCreationRequest.getPassword()));
        userRepository.save(user);
    }

    public UserResponse getMyInfo() {
        final User user = this.getUserFromContext();

        final UserResponse userResponse = userMapper.toUserResponse(user);
        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));

        final String apiKey = this.getRequiredApiKey();
        userResponse.setHasApiKey(StringUtils.hasText(apiKey));
        return userResponse;
    }

    public User getUserFromContext() {
        final var context = SecurityContextHolder.getContext();
        final String name = context.getAuthentication().getName();

        return userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }

    public String getRequiredApiKey() {
        final User user = this.getUserFromContext();
        final UserApiKey key =
                userApiKeyRepository
                        .findByUserId(user.getId()).orElse(null);
        return key != null ? key.getApiKey() : null;
    }
}
