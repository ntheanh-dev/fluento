package com.nta.domain.userPractice;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.concurrent.CompletableFuture;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;
import com.nta.domain.userPractice.dto.request.SentenceTranslationRequest;
import com.nta.domain.userPractice.dto.request.SubmitAnswerRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
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
            @RequestParam(required = false) String targetLanguage,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "desc") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        Type typeEnum = type != null && !type.isBlank() ? Type.fromString(type) : null;
        Topic topicEnum = topic != null && !topic.isBlank() ? Topic.fromString(topic) : null;
        Level levelEnum = level != null && !level.isBlank() ? Level.fromString(level) : null;
        TargetLanguage targetLanguageEnum = parseOptionalTargetLanguage(targetLanguage);
        String searchTrimmed = search != null && !search.isBlank() ? search.trim() : null;
        return ApiResponse.<Page<UserPracticeResponse>>builder()
                .result(service.getAllFiltered(
                        typeEnum, topicEnum, levelEnum, targetLanguageEnum, completed, searchTrimmed, sort, page, size))
                .build();
    }

    @GetMapping("/{id:\\d+}")
    ApiResponse<UserPracticeResponse> get(@PathVariable Long id) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.get(id))
                .build();
    }

    @PostMapping("/{paragraphId:\\d+}")
    ApiResponse<UserPracticeResponse> create(
            @PathVariable Long paragraphId,
            @RequestParam(name = "targetLanguage", required = false) String targetLanguage) {
        TargetLanguage targetLanguageEnum = parseOptionalTargetLanguage(targetLanguage);
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.create(paragraphId, targetLanguageEnum))
                .build();
    }

    @PostMapping
    ApiResponse<UserPracticeResponse> create(@RequestBody @Valid CreateParagraphRequest request) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.create(request))
                .build();
    }

    @PostMapping(value = "/{practiceId}/answers/preview", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter previewAnswer(@PathVariable Long practiceId, @RequestBody @Valid SentenceTranslationRequest request) {
        SseEmitter emitter = new SseEmitter(60_000L);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Runnable streamTask = () -> {
            try {
                SentenceFeedback feedback = service.previewFeedback(practiceId, request, chunk -> {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("preview-feedback-chunk")
                                .data(chunk));
                    } catch (IOException ioException) {
                        throw new UncheckedIOException(ioException);
                    }
                });
                ApiResponse<SentenceFeedback> payload =
                        ApiResponse.<SentenceFeedback>builder().result(feedback).build();
                emitter.send(SseEmitter.event().name("preview-feedback").data(payload));
                emitter.complete();
            } catch (IOException ex) {
                emitter.completeWithError(ex);
            } catch (UncheckedIOException ex) {
                emitter.completeWithError(ex.getCause());
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        };

        CompletableFuture.runAsync(new DelegatingSecurityContextRunnable(streamTask, securityContext));
        return emitter;
    }

    @PostMapping("/{practiceId}/answers")
    ApiResponse<UserSentenceAnswerResponse> submitAnswer(
            @PathVariable Long practiceId, @RequestBody @Valid SubmitAnswerRequest request) {
        return ApiResponse.<UserSentenceAnswerResponse>builder()
                .result(service.submitAnswer(practiceId, request))
                .build();
    }

    private TargetLanguage parseOptionalTargetLanguage(String raw) {
        if (raw == null || raw.isBlank()) {
            return null;
        }
        try {
            return TargetLanguage.fromString(raw);
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.INVALID_TARGET_LANGUAGE);
        }
    }
}
