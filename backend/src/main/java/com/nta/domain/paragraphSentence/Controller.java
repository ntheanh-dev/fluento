package com.nta.domain.paragraphSentence;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/{id}/vocabularyHints")
    ApiResponse<ParagraphSentence> getOrCreateVocabularyHints(@PathVariable Long id) {
        log.debug("Getting or creating vocabulary hints for paragraph sentence: {}", id);
        return ApiResponse.<ParagraphSentence>builder()
                .result(service.getOrCreateVocabularyHints(id))
                .build();
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
