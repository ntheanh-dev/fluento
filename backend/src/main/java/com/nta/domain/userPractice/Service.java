package com.nta.domain.userPractice;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.common.service.CommonUserService;
import com.nta.common.service.ai.ChatService;
import com.nta.common.service.ai.ParagraphPromptFactory;
import com.nta.common.service.ai.PromptMessage;
import com.nta.common.time.MysqlTime;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.user.User;
import com.nta.domain.userPractice.dto.request.SentenceTranslationRequest;
import com.nta.domain.userPractice.dto.request.SubmitAnswerRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
import com.nta.domain.userPractice.dto.response.WritingPerformancePointResponse;
import com.nta.domain.userPractice.dto.response.WritingPerformanceSeriesResponse;
import com.nta.domain.userPractice.enums.WritingPerformanceRange;
import com.nta.domain.userSentenceAnswer.SentenceFeedback;
import com.nta.domain.userSentenceAnswer.UserSentenceAnswer;
import com.nta.domain.userSentenceAnswer.dto.response.UserSentenceAnswerResponse;
import com.nta.domain.userSentenceAnswer.projection.DailyScoreStatsProjection;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("userPracticeService")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequiredArgsConstructor
public class Service {
    static final String LINE_BREAK_TOKEN = "\\n";
    static final String ALT_LINE_BREAK_TOKEN = "//n";
    com.nta.domain.paragraph.Service paragraphService;
    Repository repository;
    CommonUserService commonUserService;
    Mapper mapper;
    ParagraphPromptFactory paragraphPromptFactory;
    ChatService chatService;
    com.nta.domain.userSentenceAnswer.Repository userSentenceAnswerRepo;
    com.nta.domain.userSentenceAnswer.Mapper userSentenceAnswerMapper;
    com.nta.domain.user.Repository userRepository;
    ZoneId appZoneId;

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

    public Page<UserPracticeResponse> getAllFiltered(
            Type type, Topic topic, Level level, String search, String sortOrder, int page, int size) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        Sort sort = "asc".equalsIgnoreCase(sortOrder)
                ? Sort.by(Sort.Direction.ASC, "createdAt")
                : Sort.by(Sort.Direction.DESC, "createdAt");
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserPractice> practicePage =
                repository.findByUserIdAndFilters(userId, type, topic, level, search, pageable);
        List<UserPracticeResponse> responses = mapper.toUserPracticeResponses(practicePage.getContent());
        return new PageImpl<>(responses, practicePage.getPageable(), practicePage.getTotalElements());
    }

    @Transactional
    SentenceFeedback previewFeedback(Long practiceId, SentenceTranslationRequest request) {
        String originalSentence = validateAndGetOriginalSentence(practiceId, request.getOrderIndex());
        String normalizedTranslatedSentence =
                appendLineBreakTokenIfNeeded(originalSentence, request.getTranslatedSentence());

        PromptMessage prompt = paragraphPromptFactory.buildFeedbackTranslationMarkdownPrompt(
                originalSentence, normalizedTranslatedSentence);

        SentenceFeedback feedback = chatService
                .sendMessage(prompt.systemMessage(), prompt.userMessage(), SentenceFeedback.class)
                .getResult();

        // Tìm bản nháp trước đó cho cùng practice + orderIndex (chưa submit)
        var existingDraft = userSentenceAnswerRepo.findLatestDraft(practiceId, request.getOrderIndex());

        if (existingDraft.isPresent()) {
            UserSentenceAnswer answer = existingDraft.get();
            answer.setOriginalText(originalSentence);
            answer.setUserTranslation(normalizedTranslatedSentence);
            answer.setScore(feedback.getScore());
            answer.setFeedback(feedback);
            answer.setOrderIndex(request.getOrderIndex());
            answer.setIsSubmitted(false);
        } else {
            UserSentenceAnswer answer = UserSentenceAnswer.builder()
                    .practice(UserPractice.builder().id(practiceId).build())
                    .originalText(originalSentence)
                    .userTranslation(normalizedTranslatedSentence)
                    .score(feedback.getScore())
                    .feedback(feedback)
                    .orderIndex(request.getOrderIndex())
                    .isSubmitted(false)
                    .build();
            userSentenceAnswerRepo.save(answer);
        }

        return feedback;
    }

    @Transactional
    UserSentenceAnswerResponse submitAnswer(Long practiceId, SubmitAnswerRequest request) {
        Long currentUserId = commonUserService.getCurrentUserIdFromContext();

        UserPractice practice =
                repository.findById(practiceId).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        if (!practice.getUser().getId().equals(currentUserId)) {
            throw new AppException(ErrorCode.NOT_OWN_PRACTICE);
        }

        List<String> sentences = practice.getParagraph().getSentenceContents();

        if (request.getOrderIndex() < 0 || request.getOrderIndex() >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        String originalSentence = sentences.get(request.getOrderIndex());
        String normalizedVietnameseSentence =
                appendLineBreakTokenIfNeeded(originalSentence, request.getVietnameseSentence());

        // Lấy bản nháp feedback gần nhất cho câu này (đã được AI chấm)
        UserSentenceAnswer answer = userSentenceAnswerRepo
                .findLatestDraft(practiceId, request.getOrderIndex())
                .orElseThrow(() -> new AppException(ErrorCode.THIS_METHOD_DOES_NOTE_SUPPORT_YET));

        // Đảm bảo lưu bản dịch cuối cùng của user
        answer.setOriginalText(originalSentence);
        answer.setUserTranslation(normalizedVietnameseSentence);
        answer.setIsSubmitted(true);

        // Save learningTime on every submit
        if (request.getLearningTime() != null) {
            practice.setLearningTime(request.getLearningTime());
            repository.save(practice);
        }

        updateDailyStreak(currentUserId);

        return userSentenceAnswerMapper.toUserSentenceAnswerResponse(answer);
    }

    @Transactional
    public void updateDailyStreak(Long userId) {

        User user = userRepository.findByIdForUpdate(userId).orElseThrow(() -> new RuntimeException("User not found"));

        LocalDate today = LocalDate.now(appZoneId);
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
        List<String> sentences = paragraph.getSentenceContents();

        if (orderIndex < 0 || orderIndex >= sentences.size()) {
            throw new IllegalArgumentException("Invalid sentence index");
        }

        return sentences.get(orderIndex);
    }

    private String appendLineBreakTokenIfNeeded(String originalSentence, String translatedSentence) {
        if (translatedSentence == null || originalSentence == null) {
            return translatedSentence;
        }

        String lineBreakToken = null;
        String originalCore = originalSentence;
        if (originalSentence.endsWith(LINE_BREAK_TOKEN)) {
            lineBreakToken = LINE_BREAK_TOKEN;
            originalCore = originalSentence.substring(0, originalSentence.length() - LINE_BREAK_TOKEN.length());
        } else if (originalSentence.endsWith(ALT_LINE_BREAK_TOKEN)) {
            lineBreakToken = ALT_LINE_BREAK_TOKEN;
            originalCore = originalSentence.substring(0, originalSentence.length() - ALT_LINE_BREAK_TOKEN.length());
        }

        String normalizedSentence = translatedSentence;
        String translatedCore = translatedSentence;
        if (translatedSentence.endsWith(LINE_BREAK_TOKEN)) {
            translatedCore = translatedSentence.substring(0, translatedSentence.length() - LINE_BREAK_TOKEN.length());
        } else if (translatedSentence.endsWith(ALT_LINE_BREAK_TOKEN)) {
            translatedCore =
                    translatedSentence.substring(0, translatedSentence.length() - ALT_LINE_BREAK_TOKEN.length());
        }

        Character originalPunctuation = null;
        for (int i = originalCore.length() - 1; i >= 0; i--) {
            char c = originalCore.charAt(i);
            if (Character.isWhitespace(c)) {
                continue;
            }
            if (".,!?;:".indexOf(c) >= 0) {
                originalPunctuation = c;
            }
            break;
        }

        Character translatedPunctuation = null;
        for (int i = translatedCore.length() - 1; i >= 0; i--) {
            char c = translatedCore.charAt(i);
            if (Character.isWhitespace(c)) {
                continue;
            }
            if (".,!?;:".indexOf(c) >= 0) {
                translatedPunctuation = c;
            }
            break;
        }

        if (originalPunctuation != null && translatedPunctuation == null) {
            normalizedSentence += originalPunctuation;
        }

        boolean translatedHasLineBreak =
                normalizedSentence.endsWith(LINE_BREAK_TOKEN) || normalizedSentence.endsWith(ALT_LINE_BREAK_TOKEN);
        if (lineBreakToken != null && !translatedHasLineBreak) {
            normalizedSentence += lineBreakToken;
        }

        return normalizedSentence;
    }

    public WritingPerformanceSeriesResponse getWritingPerformance(String rangeRaw) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        WritingPerformanceRange range = WritingPerformanceRange.fromString(rangeRaw);

        LocalDate today = LocalDate.now(appZoneId);
        LocalDate startDate =
                switch (range) {
                    case LAST_7_DAYS -> today.minusDays(6);
                    case LAST_30_DAYS -> today.minusDays(29);
                };

        ZonedDateTime startZdt = startDate.atStartOfDay(appZoneId);
        ZonedDateTime endZdt = today.plusDays(1).atStartOfDay(appZoneId).minusNanos(1);
        LocalDateTime start = startZdt.withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();
        LocalDateTime end = endZdt.withZoneSameInstant(ZoneOffset.UTC).toLocalDateTime();

        String tzOffset = MysqlTime.utcToOffsetSuffix(appZoneId);
        List<DailyScoreStatsProjection> stats = userSentenceAnswerRepo.getDailyScoreStats(userId, start, end, tzOffset);
        Map<LocalDate, DailyScoreStatsProjection> byDate =
                stats.stream().collect(Collectors.toMap(DailyScoreStatsProjection::getStatDate, s -> s));

        List<WritingPerformancePointResponse> points = new ArrayList<>();
        for (LocalDate d = startDate; !d.isAfter(today); d = d.plusDays(1)) {
            DailyScoreStatsProjection s = byDate.get(d);
            double score = s != null && s.getAvgScore() != null ? s.getAvgScore() : 0d;
            long total = s != null && s.getTotalAnswers() != null ? s.getTotalAnswers() : 0L;
            String label = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            points.add(new WritingPerformancePointResponse(d, label, score, total));
        }

        return new WritingPerformanceSeriesResponse(range.name(), points);
    }
}
