package com.nta.mapper;

import com.nta.dto.response.UserResponse;
import org.mapstruct.Mapper;

import com.nta.dto.request.CreateAccountRequest;
import com.nta.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(CreateAccountRequest request);

    UserResponse toUserResponse(User user);
}
