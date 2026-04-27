package com.nta.domain.paragraphSentence;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.http.MediaType;
import org.springframework.security.concurrent.DelegatingSecurityContextRunnable;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.paragraphSentence.dto.response.CommunityTranslationResponse;
import com.nta.domain.paragraphSentence.enums.CommunityScoreBand;
import com.nta.domain.paragraphSentenceHint.ParagraphSentenceHint;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("paragraphSentenceController")
@RequestMapping("/paragraphSentence")
@Tag(name = "Paragraph Sentence", description = "Paragraph sentence management APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @GetMapping(value = "/{id}/vocabularyHints", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    SseEmitter getOrCreateVocabularyHints(
            @PathVariable Long id,
            @RequestParam(name = "targetLanguage", defaultValue = "EN") String targetLanguageParam) {
        final TargetLanguage targetLanguage = parseTargetLanguageOrThrow(targetLanguageParam);
        log.debug(
                "Getting or creating vocabulary hints for paragraph sentence: {}, targetLanguage={}",
                id,
                targetLanguage);
        SseEmitter emitter = new SseEmitter(60_000L);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Runnable streamTask = () -> {
            try {
                ParagraphSentenceHint sentenceHint = service.getOrCreateVocabularyHints(id, targetLanguage, chunk -> {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("vocabulary-hints-chunk")
                                .data(chunk));
                    } catch (IOException ioException) {
                        throw new UncheckedIOException(ioException);
                    }
                });
                ApiResponse<ParagraphSentenceHint> responseBody = ApiResponse.<ParagraphSentenceHint>builder()
                        .result(sentenceHint)
                        .build();
                emitter.send(SseEmitter.event().name("vocabulary-hints").data(responseBody));
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

    @GetMapping("/{id}/communityTranslations")
    ApiResponse<List<CommunityTranslationResponse>> getCommunityTranslations(
            @PathVariable Long id,
            @RequestParam(name = "score", defaultValue = "LE7") String scoreParam,
            @RequestParam(name = "targetLanguage", defaultValue = "EN") String targetLanguageParam) {
        CommunityScoreBand scoreBand = CommunityScoreBand.fromParam(scoreParam);
        TargetLanguage targetLanguage = parseTargetLanguageOrThrow(targetLanguageParam);
        log.debug(
                "Community translations for paragraph sentence: {}, score={}, targetLanguage={}",
                id,
                scoreBand,
                targetLanguage);
        return ApiResponse.<List<CommunityTranslationResponse>>builder()
                .result(service.getCommunityTranslations(id, scoreBand, targetLanguage))
                .build();
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
