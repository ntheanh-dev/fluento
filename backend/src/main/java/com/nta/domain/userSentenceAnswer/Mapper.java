package com.nta.domain.userSentenceAnswer;

import com.nta.domain.userSentenceAnswer.dto.response.UserSentenceAnswerResponse;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "userSentenceAnswerMapperImpl")
public interface Mapper {
    UserSentenceAnswerResponse toUserSentenceAnswerResponse(UserSentenceAnswer userSentenceAnswer);
}
