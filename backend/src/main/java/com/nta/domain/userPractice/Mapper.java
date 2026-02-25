package com.nta.domain.userPractice;

import java.util.List;

import com.nta.domain.userPractice.dto.response.UserPracticeResponse;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "UserPracticeMapperImpl")
public interface Mapper {
    UserPracticeResponse toUserPracticeResponse(UserPractice userPractice);

    List<UserPracticeResponse> toUserPracticeResponses(List<UserPractice> userPractices);
}
