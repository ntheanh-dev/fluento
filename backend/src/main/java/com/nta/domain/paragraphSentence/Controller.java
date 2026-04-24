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
import com.nta.domain.paragraphSentence.dto.response.CommunityTranslationResponse;
import com.nta.domain.paragraphSentence.enums.CommunityScoreBand;

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
    SseEmitter getOrCreateVocabularyHints(@PathVariable Long id) {
        log.debug("Getting or creating vocabulary hints for paragraph sentence: {}", id);
        SseEmitter emitter = new SseEmitter(60_000L);
        SecurityContext securityContext = SecurityContextHolder.getContext();
        Runnable streamTask = () -> {
            try {
                ParagraphSentence sentence = service.getOrCreateVocabularyHints(id, chunk -> {
                    try {
                        emitter.send(SseEmitter.event()
                                .name("vocabulary-hints-chunk")
                                .data(chunk));
                    } catch (IOException ioException) {
                        throw new UncheckedIOException(ioException);
                    }
                });
                ApiResponse<ParagraphSentence> responseBody = ApiResponse.<ParagraphSentence>builder()
                        .result(sentence)
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
            @PathVariable Long id, @RequestParam(name = "score", defaultValue = "LE7") String scoreParam) {
        CommunityScoreBand scoreBand = CommunityScoreBand.fromParam(scoreParam);
        log.debug("Community translations for paragraph sentence: {}, score={}", id, scoreBand);
        return ApiResponse.<List<CommunityTranslationResponse>>builder()
                .result(service.getCommunityTranslations(id, scoreBand))
                .build();
    }
}
