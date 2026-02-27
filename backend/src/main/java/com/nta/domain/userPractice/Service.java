package com.nta.domain.userPractice;

import java.util.List;

import jakarta.transaction.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.SentenceUtils;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.userPractice.dto.request.SentenceTranslationRequest;
import com.nta.domain.userPractice.dto.request.SubmitAnswerRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
import com.nta.domain.userSentenceAnswer.SentenceFeedback;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;

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
    Mapper mapper;
    ParagraphPromptFactory paragraphPromptFactory;
    ChatService chatService;
    com.nta.domain.userSentenceAnswer.Repository userSentenceAnswerRepo;

    @Transactional
    UserPracticeResponse create(CreateParagraphRequest request) {
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

        return mapper.toUserPracticeResponse(repository.save(practice));
    }

    UserPracticeResponse get(Long id) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        UserPractice userPractice = repository
                .findByIdAndUserId(id, userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return mapper.toUserPracticeResponse(userPractice);
    }

    List<UserPracticeResponse> getAll() {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        List<UserPractice> userPractices = repository.findByUserId(userId);
        return mapper.toUserPracticeResponses(userPractices);
    }

    @Transactional
    SentenceFeedback translate(Long practiceId, SentenceTranslationRequest request) {
        // 1. Lấy practice
        UserPractice practice =
                repository.findById(practiceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // 2. (Quan trọng) Validate user sở hữu practice
        Long currentUserId = commonUserService.getCurrentUserIdFromContext();
        if (!practice.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.NOT_OWN_PRACTICE);
        }

        // 3. Lấy paragraph
        Paragraph paragraph = practice.getParagraph();

        // 4. Tách câu
        List<String> sentences = SentenceUtils.splitSentences(paragraph.getContent());

        if (request.getOrderIndex() >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        String originalSentence = sentences.get(request.getOrderIndex());

        // 5. Gọi AI chấm điểm
        PromptMessage prompt = paragraphPromptFactory.buildFeedbackTranslationPrompt(
                originalSentence, request.getVietnameseSentence());

        SentenceFeedback response = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), SentenceFeedback.class)
                .getResult();

        return response;
    }

    @Transactional
    void submitAnswer(Long practiceId, SubmitAnswerRequest request) {
        // 1. Lấy practice
        UserPractice practice =
                repository.findById(practiceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // 2. (Quan trọng) Validate user sở hữu practice
        Long currentUserId = commonUserService.getCurrentUserIdFromContext();
        if (!practice.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.NOT_OWN_PRACTICE);
        }

        // 3. Lấy paragraph
        Paragraph paragraph = practice.getParagraph();

        // 4. Tách câu
        List<String> sentences = SentenceUtils.splitSentences(paragraph.getContent());

        if (request.getOrderIndex() >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        String originalSentence = sentences.get(request.getOrderIndex());

        UserSentenceAnswer answer = UserSentenceAnswer.builder()
                .practice(practice)
                .originalText(originalSentence)
                .userTranslation(request.getVietnameseSentence())
                .score(request.getFeedback().getScore())
                .feedback(request.getFeedback())
                .build();

        userSentenceAnswerRepo.save(answer);
    }
}
