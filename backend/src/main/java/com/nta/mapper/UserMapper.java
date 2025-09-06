package com.nta.mapper;

import org.mapstruct.Mapper;

import com.nta.dto.request.CreateAccountRequest;
import com.nta.dto.response.UserResponse;
import com.nta.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(CreateAccountRequest request);

    UserResponse toUserResponse(User user);
}
