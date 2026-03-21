package com.nta.domain.paragraphSentence;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;

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
}
