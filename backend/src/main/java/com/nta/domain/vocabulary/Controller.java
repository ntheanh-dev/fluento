package com.nta.domain.vocabulary;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.vocabulary.dto.request.UpdateVocabularyRequest;
import com.nta.domain.vocabulary.dto.response.VocabularyResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController("vocabularyController")
@RequestMapping("/vocabularies")
@Tag(name = "Vocabulary", description = "Vocabulary APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @PutMapping("/{vocabularyId}")
    ApiResponse<VocabularyResponse> updateVocabulary(
            @PathVariable Long vocabularyId, @RequestBody @Valid UpdateVocabularyRequest request) {
        return ApiResponse.<VocabularyResponse>builder()
                .result(service.updateVocabulary(vocabularyId, request))
                .build();
    }

    @DeleteMapping("/{vocabularyId}")
    ApiResponse<Void> deleteVocabulary(@PathVariable Long vocabularyId) {
        service.deleteVocabulary(vocabularyId);
        return ApiResponse.<Void>builder().build();
    }
}
