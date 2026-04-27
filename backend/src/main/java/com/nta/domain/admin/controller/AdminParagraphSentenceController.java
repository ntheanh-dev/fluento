package com.nta.domain.admin.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.admin.dto.request.UpdateParagraphSentenceAdminRequest;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.Repository;
import com.nta.domain.paragraphSentence.ParagraphSentence;
import com.nta.domain.paragraphSentence.Service;
import com.nta.domain.paragraphSentenceHint.ParagraphSentenceHint;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

import lombok.RequiredArgsConstructor;

@RestController("adminParagraphSentenceController")
@RequestMapping("/admin/paragraph-sentences")
@RequiredArgsConstructor
public class AdminParagraphSentenceController {

    private final Repository paragraphRepository;
    private final com.nta.domain.paragraphSentence.Repository paragraphSentenceRepository;
    private final Service paragraphSentenceService;

    @GetMapping("/by-paragraph/{paragraphId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ParagraphSentence>> listByParagraph(@PathVariable Long paragraphId) {
        Paragraph paragraph = paragraphRepository
                .findById(paragraphId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return ApiResponse.<List<ParagraphSentence>>builder()
                .result(paragraph.getSentences())
                .build();
    }

    @PostMapping("/{sentenceId}/hints/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ParagraphSentenceHint> generateHints(
            @PathVariable Long sentenceId,
            @RequestParam(name = "targetLanguage", defaultValue = "EN") String targetLanguageParam) {
        TargetLanguage targetLanguage = parseTargetLanguageOrThrow(targetLanguageParam);
        ParagraphSentenceHint updated =
                paragraphSentenceService.getOrCreateVocabularyHints(sentenceId, targetLanguage, null);
        return ApiResponse.<ParagraphSentenceHint>builder().result(updated).build();
    }

    @DeleteMapping("/{sentenceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long sentenceId) {
        if (!paragraphSentenceRepository.existsById(sentenceId)) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND);
        }
        paragraphSentenceRepository.deleteById(sentenceId);
        return ApiResponse.<Void>builder().build();
    }

    @PutMapping("/{sentenceId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ParagraphSentence> updateContent(
            @PathVariable Long sentenceId,
            @RequestBody @jakarta.validation.Valid UpdateParagraphSentenceAdminRequest request) {

        ParagraphSentence sentence = paragraphSentenceRepository
                .findById(sentenceId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        sentence.setContent(request.getContent());
        ParagraphSentence saved = paragraphSentenceRepository.save(sentence);
        return ApiResponse.<ParagraphSentence>builder().result(saved).build();
    }

    private TargetLanguage parseTargetLanguageOrThrow(String raw) {
        try {
            TargetLanguage parsed = TargetLanguage.fromString(raw);
            return parsed != null ? parsed : TargetLanguage.EN;
        } catch (IllegalArgumentException ex) {
            throw new AppException(ErrorCode.INVALID_TARGET_LANGUAGE);
        }
    }
}
