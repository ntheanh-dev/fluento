package com.nta.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nta.dto.request.ReviewCardRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.CardResponse;
import com.nta.dto.response.StudySessionResponse;
import com.nta.entity.User;
import com.nta.service.StudyService;
import com.nta.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/study")
@RequiredArgsConstructor
public class StudyController {

    private final StudyService studyService;
    private final UserService userService;

    @GetMapping("/session")
    public ResponseEntity<ApiResponse<StudySessionResponse>> getStudySession() {
        User user = userService.getUserFromContext();
        Long userId = user.getId();
        StudySessionResponse response = studyService.getStudySession(userId);

        return ResponseEntity.ok(ApiResponse.<StudySessionResponse>builder()
                .code(1000)
                .message("Study session retrieved successfully")
                .result(response)
                .build());
    }

    @PostMapping("/review")
    public ResponseEntity<ApiResponse<Void>> reviewCard(@Valid @RequestBody ReviewCardRequest request) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        studyService.reviewCard(userId, request);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Card reviewed successfully")
                .result(null)
                .build());
    }

    @GetMapping("/decks/{deckId}/cards")
    public ResponseEntity<ApiResponse<List<CardResponse>>> getCardsForDeck(@PathVariable Long deckId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        List<CardResponse> cards = studyService.getCardsForDeck(deckId, userId);

        return ResponseEntity.ok(ApiResponse.<List<CardResponse>>builder()
                .code(1000)
                .message("Cards retrieved successfully")
                .result(cards)
                .build());
    }

    @GetMapping("/cards/{cardId}")
    public ResponseEntity<ApiResponse<CardResponse>> getCardById(@PathVariable Long cardId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        CardResponse response = studyService.getCardById(cardId, userId);

        return ResponseEntity.ok(ApiResponse.<CardResponse>builder()
                .code(1000)
                .message("Card retrieved successfully")
                .result(response)
                .build());
    }
}
