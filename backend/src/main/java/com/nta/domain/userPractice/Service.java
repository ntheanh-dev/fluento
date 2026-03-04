package com.nta.domain.userPractice;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.function.Consumer;

import jakarta.transaction.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.SentenceUtils;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.user.User;
import com.nta.domain.userPractice.dto.request.SentenceTranslationRequest;
import com.nta.domain.userPractice.dto.request.SubmitAnswerRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
import com.nta.domain.userPractice.projection.PracticeSubmitProjection;
import com.nta.domain.userSentenceAnswer.SentenceFeedback;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;
import com.nta.domain.userSentenceAnswer.dto.response.UserSentenceAnswerResponse;

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
    com.nta.domain.userSentenceAnswer.Mapper userSentenceAnswerMapper;
    com.nta.domain.user.Repository userRepository;

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
                .sentenceAnswers(List.of())
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
    void streamFeedbackMarkdown(Long practiceId, SentenceTranslationRequest request, Consumer<String> onChunk) {
        String originalSentence = validateAndGetOriginalSentence(practiceId, request.getOrderIndex());

        PromptMessage prompt = paragraphPromptFactory.buildFeedbackTranslationMarkdownPrompt(
                originalSentence, request.getTranslatedSentence());

        StringBuilder buffer = new StringBuilder();

        chatService.streamMessage(prompt.systemMessage(), prompt.userMessage(), chunk -> {
            buffer.append(chunk);
            onChunk.accept(chunk);
        });

        try {
            // Sau khi stream xong, parse JSON feedback đơn giản
            ObjectMapper mapper = new ObjectMapper();
            SentenceFeedback feedback = mapper.readValue(buffer.toString().trim(), SentenceFeedback.class);

            // Tìm bản nháp trước đó cho cùng practice + orderIndex (chưa submit)
            var existingDraft = userSentenceAnswerRepo.findLatestDraft(practiceId, request.getOrderIndex());

            if (existingDraft.isPresent()) {
                UserSentenceAnswer answer = existingDraft.get();
                answer.setOriginalText(originalSentence);
                answer.setUserTranslation(request.getTranslatedSentence());
                answer.setScore(feedback.getScore());
                answer.setFeedback(feedback);
                answer.setOrderIndex(request.getOrderIndex());
                answer.setIsSubmitted(false);
            } else {
                UserSentenceAnswer answer = UserSentenceAnswer.builder()
                        .practice(UserPractice.builder().id(practiceId).build())
                        .originalText(originalSentence)
                        .userTranslation(request.getTranslatedSentence())
                        .score(feedback.getScore())
                        .feedback(feedback)
                        .orderIndex(request.getOrderIndex())
                        .isSubmitted(false)
                        .build();
                userSentenceAnswerRepo.save(answer);
            }

        } catch (Exception e) {
            log.error(
                    "Failed to parse or persist AI feedback for practiceId={}, orderIndex={}",
                    practiceId,
                    request.getOrderIndex(),
                    e);
        }
    }

    @Transactional
    UserSentenceAnswerResponse submitAnswer(Long practiceId, SubmitAnswerRequest request) {
        Long currentUserId = commonUserService.getCurrentUserIdFromContext();

        // 1 query duy nhất
        PracticeSubmitProjection data =
                repository.findSubmitData(practiceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // validate owner
        if (!data.getUserId().equals(currentUserId)) {
            throw new AppException(ErrorCode.NOT_OWN_PRACTICE);
        }

        // split sentence
        List<String> sentences = SentenceUtils.splitSentences(data.getParagraphContent());

        if (request.getOrderIndex() < 0 || request.getOrderIndex() >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        String originalSentence = sentences.get(request.getOrderIndex());

        // Lấy bản nháp feedback gần nhất cho câu này (đã được AI chấm)
        UserSentenceAnswer answer = userSentenceAnswerRepo
                .findLatestDraft(practiceId, request.getOrderIndex())
                .orElseThrow(() -> new AppException(ErrorCode.THIS_METHOD_DOES_NOTE_SUPPORT_YET));

        // Đảm bảo lưu bản dịch cuối cùng của user
        answer.setOriginalText(originalSentence);
        answer.setUserTranslation(request.getVietnameseSentence());
        answer.setIsSubmitted(true);

        updateDailyStreak(currentUserId);

        return userSentenceAnswerMapper.toUserSentenceAnswerResponse(answer);
    }

    @Transactional
    public void updateDailyStreak(Long userId) {

        User user = userRepository.findByIdForUpdate(userId).orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate lastDate = user.getLastSubmissionDate();

        // Case 1: first time submit
        if (lastDate == null) {
            user.setCurrentStreak(1);
            user.setLongestStreak(1);
            user.setLastSubmissionDate(today);
            return;
        }

        // Case 2: already submitted today -> do nothing
        if (lastDate.isEqual(today)) {
            return;
        }

        // Case 3: yesterday -> continue streak
        if (lastDate.plusDays(1).isEqual(today)) {
            int newStreak = user.getCurrentStreak() + 1;
            user.setCurrentStreak(newStreak);

            if (newStreak > user.getLongestStreak()) {
                user.setLongestStreak(newStreak);
            }

        } else {
            // Case 4: missed day -> reset
            user.setCurrentStreak(1);
        }

        user.setLastSubmissionDate(today);
    }

    private String validateAndGetOriginalSentence(Long practiceId, int orderIndex) {
        UserPractice practice =
                repository.findById(practiceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        Long currentUserId = commonUserService.getCurrentUserIdFromContext();
        if (!practice.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.NOT_OWN_PRACTICE);
        }

        Paragraph paragraph = practice.getParagraph();
        List<String> sentences = SentenceUtils.splitSentences(paragraph.getContent());

        if (orderIndex < 0 || orderIndex >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        return sentences.get(orderIndex);
    }
}
