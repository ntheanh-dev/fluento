package com.nta.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.nta.dto.request.CreateDeckRequest;
import com.nta.dto.response.ApiResponse;
import com.nta.dto.response.DeckResponse;
import com.nta.entity.User;
import com.nta.service.DeckService;
import com.nta.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/decks")
@RequiredArgsConstructor
public class DeckController {

    private final DeckService deckService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<DeckResponse>> createDeck(@Valid @RequestBody CreateDeckRequest request) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        DeckResponse response = deckService.createDeck(userId, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<DeckResponse>builder()
                        .code(1000)
                        .message("Deck created successfully")
                        .result(response)
                        .build());
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DeckResponse>>> getUserDecks() {
        User user = userService.getUserFromContext();
        Long userId = user.getId();
        List<DeckResponse> decks = deckService.getUserDecks(userId);

        return ResponseEntity.ok(ApiResponse.<List<DeckResponse>>builder()
                .code(1000)
                .message("Decks retrieved successfully")
                .result(decks)
                .build());
    }

    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<Page<DeckResponse>>> getUserDecksPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        Page<DeckResponse> decks = deckService.getUserDecksPaginated(userId, page, size, sortBy, sortDir);

        return ResponseEntity.ok(ApiResponse.<Page<DeckResponse>>builder()
                .code(1000)
                .message("Decks retrieved successfully")
                .result(decks)
                .build());
    }

    @GetMapping("/{deckId}")
    public ResponseEntity<ApiResponse<DeckResponse>> getDeckById(@PathVariable Long deckId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        DeckResponse response = deckService.getDeckById(deckId, userId);

        return ResponseEntity.ok(ApiResponse.<DeckResponse>builder()
                .code(1000)
                .message("Deck retrieved successfully")
                .result(response)
                .build());
    }

    @PutMapping("/{deckId}")
    public ResponseEntity<ApiResponse<DeckResponse>> updateDeck(
            @PathVariable Long deckId, @Valid @RequestBody CreateDeckRequest request) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        DeckResponse response = deckService.updateDeck(deckId, userId, request);

        return ResponseEntity.ok(ApiResponse.<DeckResponse>builder()
                .code(1000)
                .message("Deck updated successfully")
                .result(response)
                .build());
    }

    @DeleteMapping("/{deckId}")
    public ResponseEntity<ApiResponse<Void>> deleteDeck(@PathVariable Long deckId) {

        User user = userService.getUserFromContext();
        Long userId = user.getId();
        deckService.deleteDeck(deckId, userId);

        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .code(1000)
                .message("Deck deleted successfully")
                .result(null)
                .build());
    }
}
