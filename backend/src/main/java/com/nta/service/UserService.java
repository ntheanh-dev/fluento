package com.nta.service;

import com.nta.dto.request.PasswordCreationRequest;
import com.nta.dto.response.UserResponse;
import com.nta.entity.User;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.mapper.UserMapper;
import com.nta.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

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

        user.setPassword(passwordCreationRequest.getPassword());
        userRepository.save(user);
    }

    public UserResponse getMyInfo() {
        final User user = this.getUserFromContext();

        final UserResponse userResponse = userMapper.toUserResponse(user);
        userResponse.setNoPassword(!StringUtils.hasText(user.getPassword()));
        return userResponse;
    }

    private User getUserFromContext() {
        final var context = SecurityContextHolder.getContext();
        final String name = context.getAuthentication().getName();

        return userRepository
                .findByUsername(name)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTED));
    }
}
