package com.nta.domain.userPractice;

import java.util.List;
import java.util.Objects;

import org.mapstruct.Mapping;
import org.mapstruct.Named;

import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;

@org.mapstruct.Mapper(componentModel = "spring", implementationName = "UserPracticeMapperImpl")
public interface Mapper {
    @Mapping(target = "sentenceAnswers", source = "sentenceAnswers", qualifiedByName = "submittedSentenceAnswersOnly")
    UserPracticeResponse toUserPracticeResponse(UserPractice userPractice);

    List<UserPracticeResponse> toUserPracticeResponses(List<UserPractice> userPractices);

    @Named("submittedSentenceAnswersOnly")
    default List<UserSentenceAnswer> submittedSentenceAnswersOnly(List<UserSentenceAnswer> sentenceAnswers) {
        if (sentenceAnswers == null) {
            return List.of();
        }
        return sentenceAnswers.stream()
                .filter(Objects::nonNull)
                .filter(answer -> Boolean.TRUE.equals(answer.getIsSubmitted()))
                .toList();
    }
}
