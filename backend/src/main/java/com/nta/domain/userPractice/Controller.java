package com.nta.domain.userPractice;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.userPractice.dto.request.SentenceTranslationRequest;
import com.nta.domain.userPractice.dto.request.SubmitAnswerRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
import com.nta.domain.userPractice.dto.response.WritingPerformanceSeriesResponse;
import com.nta.domain.userSentenceAnswer.SentenceFeedback;
import com.nta.domain.userSentenceAnswer.dto.response.UserSentenceAnswerResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("userPracticeController")
@RequestMapping("/user-practices")
@Tag(name = "User Practice")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @GetMapping
    ApiResponse<Page<UserPracticeResponse>> getAll(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Type typeEnum = type != null && !type.isBlank() ? Type.fromString(type) : null;
        Topic topicEnum = topic != null && !topic.isBlank() ? Topic.fromString(topic) : null;
        Level levelEnum = level != null && !level.isBlank() ? Level.fromString(level) : null;
        String searchTrimmed = search != null && !search.isBlank() ? search.trim() : null;
        return ApiResponse.<Page<UserPracticeResponse>>builder()
                .result(service.getAllFiltered(typeEnum, topicEnum, levelEnum, searchTrimmed, sort, page, size))
                .build();
    }

    @GetMapping("/writing-performance")
    ApiResponse<WritingPerformanceSeriesResponse> getWritingPerformance(@RequestParam String range) {
        return ApiResponse.<WritingPerformanceSeriesResponse>builder()
                .result(service.getWritingPerformance(range))
                .build();
    }

    @GetMapping("/{id:\\d+}")
    ApiResponse<UserPracticeResponse> get(@PathVariable Long id) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.get(id))
                .build();
    }

    @PostMapping("/{paragraphId:\\d+}")
    ApiResponse<UserPracticeResponse> create(@PathVariable Long paragraphId) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.create(paragraphId))
                .build();
    }

    @PostMapping("/{practiceId}/answers/preview")
    ApiResponse<SentenceFeedback> previewAnswer(
            @PathVariable Long practiceId, @RequestBody @Valid SentenceTranslationRequest request) {
        return ApiResponse.<SentenceFeedback>builder()
                .result(service.previewFeedback(practiceId, request))
                .build();
    }

    @PostMapping("/{practiceId}/answers")
    ApiResponse<UserSentenceAnswerResponse> submitAnswer(
            @PathVariable Long practiceId, @RequestBody @Valid SubmitAnswerRequest request) {
        return ApiResponse.<UserSentenceAnswerResponse>builder()
                .result(service.submitAnswer(practiceId, request))
                .build();
    }
}
