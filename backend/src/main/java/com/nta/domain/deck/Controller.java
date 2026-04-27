package com.nta.domain.deck;

import java.util.List;

import jakarta.validation.Valid;

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
import com.nta.domain.deck.dto.request.AddVocabularyToDeckRequest;
import com.nta.domain.deck.dto.request.CreateDeckRequest;
import com.nta.domain.deck.dto.request.UpdateDeckRequest;
import com.nta.domain.deck.dto.response.DeckDetailResponse;
import com.nta.domain.deck.dto.response.DeckResponse;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController("deckController")
@RequestMapping("/decks")
@Tag(name = "Deck", description = "Vocabulary deck APIs")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {
    Service service;

    @GetMapping
    ApiResponse<List<DeckResponse>> getMyDecks(@RequestParam(required = false) String targetLanguage) {
        return ApiResponse.<List<DeckResponse>>builder()
                .result(service.getMyDecks(parseOptionalTargetLanguage(targetLanguage)))
                .build();
    }

    @PostMapping
    ApiResponse<DeckResponse> createMyDeck(@RequestBody @Valid CreateDeckRequest request) {
        return ApiResponse.<DeckResponse>builder()
                .result(service.createMyDeck(request))
                .build();
    }

    @GetMapping("/{deckId}")
    ApiResponse<DeckDetailResponse> getMyDeckDetail(@PathVariable Long deckId) {
        return ApiResponse.<DeckDetailResponse>builder()
                .result(service.getMyDeckDetail(deckId))
                .build();
    }

    @PostMapping("/{deckId}/vocabularies")
    ApiResponse<DeckResponse> addVocabularyToDeck(
            @PathVariable Long deckId, @RequestBody @Valid AddVocabularyToDeckRequest request) {
        return ApiResponse.<DeckResponse>builder()
                .result(service.addVocabularyToDeck(deckId, request))
                .build();
    }

    @PutMapping("/{deckId}")
    ApiResponse<DeckResponse> updateMyDeck(@PathVariable Long deckId, @RequestBody @Valid UpdateDeckRequest request) {
        return ApiResponse.<DeckResponse>builder()
                .result(service.updateMyDeck(deckId, request))
                .build();
    }

    @DeleteMapping("/{deckId}")
    ApiResponse<Void> deleteMyDeck(@PathVariable Long deckId) {
        service.deleteMyDeck(deckId);
        return ApiResponse.<Void>builder().build();
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
