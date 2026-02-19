package com.nta.domain.user;

import com.nta.domain.auth.dto.request.CreateAccountRequest;
import com.nta.domain.user.dto.response.UserResponse;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "UserMapperImpl")
public interface Mapper {
    User toUser(CreateAccountRequest request);

    UserResponse toUserResponse(User user);
}
