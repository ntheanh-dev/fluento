package com.nta.domain.userPractice;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.userPractice.dto.request.SentenceTranslationRequest;
import com.nta.domain.userPractice.dto.request.SubmitAnswerRequest;
import com.nta.domain.userPractice.dto.response.UserPracticeResponse;
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

    @GetMapping("/{id}")
    ApiResponse<UserPracticeResponse> get(@PathVariable Long id) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.get(id))
                .build();
    }

    @PostMapping
    ApiResponse<UserPracticeResponse> create(@RequestBody @Valid CreateParagraphRequest request) {
        return ApiResponse.<UserPracticeResponse>builder()
                .result(service.create(request))
                .build();
    }

    @PostMapping(value = "/{practiceId}/answers/preview/stream-markdown", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public StreamingResponseBody checkAnswerMarkdownStream(
            @PathVariable Long practiceId, @RequestBody @Valid SentenceTranslationRequest request) {
        return outputStream -> service.streamFeedbackMarkdown(practiceId, request, chunk -> {
            try {
                writeChunk(outputStream, chunk);
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        });
    }

    @PostMapping("/{practiceId}/answers")
    ApiResponse<UserSentenceAnswerResponse> submitAnswer(
            @PathVariable Long practiceId, @RequestBody @Valid SubmitAnswerRequest request) {
        return ApiResponse.<UserSentenceAnswerResponse>builder()
                .result(service.submitAnswer(practiceId, request))
                .build();
    }

    private void writeChunk(OutputStream outputStream, String content) throws IOException {
        outputStream.write(content.getBytes(StandardCharsets.UTF_8));
        outputStream.flush();
    }
}
