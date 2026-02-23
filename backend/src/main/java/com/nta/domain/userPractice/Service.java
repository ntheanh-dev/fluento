package com.nta.domain.userPractice;

import jakarta.transaction.Transactional;

import com.nta.common.service.CommonUserService;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("userPracticeService")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequiredArgsConstructor
public class Service {
    com.nta.domain.paragraph.Service paragraphService;
    Repository repository;
    CommonUserService commonUserService;

    @Transactional
    UserPractice create(CreateParagraphRequest request) {
        // NOTE: Sau khi có một lượng data paragraph rồi thì ko cần dùng ai để tạo nữa mà sẽ query trong db
        Paragraph paragraph = paragraphService.findOrcreate(request);

        // NOTE: Cần querry để tìm maxAttempt
        // Integer nextAttempt = repository
        //         .findMaxAttempt(userId, paragraph.getId())
        //         .orElse(0) + 1;

        UserPractice practice = UserPractice.builder()
                .user(commonUserService.getUserFromContext())
                .paragraph(paragraph)
                .attemptNumber(1)
                .build();

        return repository.save(practice);
    }
}
