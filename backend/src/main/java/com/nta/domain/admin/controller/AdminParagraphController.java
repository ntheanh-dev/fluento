package com.nta.domain.admin.controller;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.admin.dto.request.UpdateParagraphAdminRequest;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.Repository;
import com.nta.domain.paragraph.Service;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;

import lombok.RequiredArgsConstructor;

@RestController("adminParagraphController")
@RequestMapping("/admin/paragraphs")
@RequiredArgsConstructor
public class AdminParagraphController {

    private final Repository paragraphRepository;
    private final Service paragraphService;
    private final com.nta.domain.userPractice.Repository userPracticeRepository;
    private final com.nta.domain.userSentenceAnswer.Repository userSentenceAnswerRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<Paragraph>> list(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String tone,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String sentenceCount,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Type typeEnum = type != null && !type.isBlank() ? Type.fromString(type) : null;
        Tone toneEnum = tone != null && !tone.isBlank() ? Tone.fromString(tone) : null;
        Topic topicEnum = topic != null && !topic.isBlank() ? Topic.fromString(topic) : null;
        Level levelEnum = level != null && !level.isBlank() ? Level.fromString(level) : null;
        Integer maxSentenceCount = parseMaxSentenceCount(sentenceCount);
        SentenceCount sentenceCountEnum = maxSentenceCount == null && sentenceCount != null && !sentenceCount.isBlank()
                ? SentenceCount.fromString(sentenceCount)
                : null;

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Paragraph> result = paragraphRepository.findWithOptionalFilters(
                typeEnum, toneEnum, topicEnum, levelEnum, sentenceCountEnum, maxSentenceCount, false, pageable);
        return ApiResponse.<Page<Paragraph>>builder().result(result).build();
    }

    private Integer parseMaxSentenceCount(String sentenceCount) {
        if (sentenceCount == null) {
            return null;
        }
        String trimmed = sentenceCount.trim();
        if (!trimmed.startsWith("<=")) {
            return null;
        }
        String numberPart = trimmed.substring(2).trim();
        if (numberPart.isBlank()) {
            return null;
        }
        try {
            int parsed = Integer.parseInt(numberPart);
            return parsed > 0 ? parsed : null;
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Paragraph> get(@PathVariable Long id) {
        Paragraph paragraph =
                paragraphRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return ApiResponse.<Paragraph>builder().result(paragraph).build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Paragraph> create(@RequestBody CreateParagraphRequest request) {
        return ApiResponse.<Paragraph>builder()
                .result(paragraphService.findOrcreate(request))
                .message("Paragraph created successfully")
                .build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public ApiResponse<Void> delete(@PathVariable Long id) {
        if (!paragraphRepository.existsById(id)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }

        // Ensure child rows are removed first to satisfy FK constraints.
        userSentenceAnswerRepository.deleteByPracticeParagraphId(id);
        userPracticeRepository.deleteByParagraphId(id);
        paragraphRepository.deleteById(id);

        return ApiResponse.<Void>builder()
                .message("Paragraph deleted successfully")
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Paragraph> updateTitle(
            @PathVariable Long id, @Valid @RequestBody UpdateParagraphAdminRequest request) {
        Paragraph paragraph =
                paragraphRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        String trimmed = request.getTitle() != null ? request.getTitle().trim() : null;
        if (trimmed == null || trimmed.isBlank()) {
            throw new AppException(ErrorCode.NOT_NULL);
        }

        paragraph.setTitle(trimmed);
        Paragraph saved = paragraphRepository.save(paragraph);
        return ApiResponse.<Paragraph>builder()
                .result(saved)
                .message("Paragraph updated successfully")
                .build();
    }
}
