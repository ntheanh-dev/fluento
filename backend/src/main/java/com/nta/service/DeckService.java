package com.nta.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nta.dto.request.CreateDeckRequest;
import com.nta.dto.response.DeckResponse;
import com.nta.entity.Deck;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.repository.CardRepository;
import com.nta.repository.DeckRepository;
import com.nta.repository.NoteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class DeckService {

    private final DeckRepository deckRepository;
    private final NoteRepository noteRepository;
    private final CardRepository cardRepository;

    public DeckResponse createDeck(Long userId, CreateDeckRequest request) {
        // Check if deck name already exists for this user
        if (deckRepository.findByUserIdAndName(userId, request.getName()).isPresent()) {
            throw new AppException(ErrorCode.DECK_NAME_EXISTS);
        }

        Deck deck = new Deck();
        deck.setName(request.getName());
        deck.setUserId(userId);

        Deck savedDeck = deckRepository.save(deck);
        return convertToResponse(savedDeck);
    }

    @Transactional(readOnly = true)
    public List<DeckResponse> getUserDecks(Long userId) {
        List<Deck> decks = deckRepository.findByUserId(userId);
        return decks.stream().map(this::convertToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<DeckResponse> getUserDecksPaginated(Long userId, int page, int size, String sortBy, String sortDir) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Deck> deckPage = deckRepository.findByUserId(userId, pageable);
        return deckPage.map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public DeckResponse getDeckById(Long deckId, Long userId) {
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new AppException(ErrorCode.DECK_NOT_FOUND));

        // Check if user has access to this deck
        if (!deck.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        return convertToResponse(deck);
    }

    public DeckResponse updateDeck(Long deckId, Long userId, CreateDeckRequest request) {
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new AppException(ErrorCode.DECK_NOT_FOUND));

        if (!deck.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Check if new name conflicts with existing deck
        if (!deck.getName().equals(request.getName())) {
            if (deckRepository.findByUserIdAndName(userId, request.getName()).isPresent()) {
                throw new AppException(ErrorCode.DECK_NAME_EXISTS);
            }
        }

        deck.setName(request.getName());

        Deck updatedDeck = deckRepository.save(deck);
        return convertToResponse(updatedDeck);
    }

    public void deleteDeck(Long deckId, Long userId) {
        Deck deck = deckRepository.findById(deckId).orElseThrow(() -> new AppException(ErrorCode.DECK_NOT_FOUND));

        if (!deck.getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        deckRepository.delete(deck);
    }

    private DeckResponse convertToResponse(Deck deck) {
        DeckResponse response = new DeckResponse();
        response.setId(deck.getId());
        response.setName(deck.getName());
        response.setUserId(deck.getUserId());
        response.setCreatedAt(deck.getCreatedAt());
        response.setUpdatedAt(deck.getUpdatedAt());

        // Get counts
        response.setNoteCount(noteRepository.countByDeckId(deck.getId()));
        response.setCardCount(cardRepository.countByDeckId(deck.getId()));

        return response;
    }
}
