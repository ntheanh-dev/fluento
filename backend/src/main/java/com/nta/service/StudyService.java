package com.nta.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nta.dto.request.ReviewCardRequest;
import com.nta.dto.response.CardResponse;
import com.nta.dto.response.StudySessionResponse;
import com.nta.entity.Card;
import com.nta.entity.CardStats;
import com.nta.entity.Field;
import com.nta.entity.NoteField;
import com.nta.enums.ErrorCode;
import com.nta.exception.AppException;
import com.nta.repository.CardRepository;
import com.nta.repository.CardStatsRepository;
import com.nta.repository.FieldRepository;
import com.nta.repository.NoteFieldRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class StudyService {

    private final CardRepository cardRepository;
    private final CardStatsRepository cardStatsRepository;
    private final SpacedRepetitionService spacedRepetitionService;
    private final NoteFieldRepository noteFieldRepository;
    private final FieldRepository fieldRepository;

    @Transactional(readOnly = true)
    public StudySessionResponse getStudySession(Long userId) {
        List<CardStats> dueCards = spacedRepetitionService.getDueCards(userId);
        List<CardStats> todayDueCards = spacedRepetitionService.getTodayDueCards(userId);

        Long totalCards = spacedRepetitionService.getTotalCardsCount(userId);
        Long learnedCards = spacedRepetitionService.getLearnedCardsCount(userId);
        Long dueToday = (long) todayDueCards.size();
        Long newToday = dueCards.stream()
                .mapToLong(card -> card.getRepetitions() == 0 ? 1 : 0)
                .sum();
        Long reviewToday = dueToday - newToday;

        // Get cards to study (limit to reasonable number for a session)
        List<CardStats> cardsToStudy = dueCards.stream()
                .limit(20) // Limit to 20 cards per session
                .collect(Collectors.toList());

        List<CardResponse> cardResponses =
                cardsToStudy.stream().map(this::convertCardStatsToResponse).collect(Collectors.toList());

        StudySessionResponse response = new StudySessionResponse();
        response.setTotalCards(totalCards);
        response.setDueCards((long) dueCards.size());
        response.setNewCards(newToday);
        response.setReviewCards(reviewToday);
        response.setCardsToStudy(cardResponses);

        // Set stats
        StudySessionResponse.StudyStatsResponse stats = new StudySessionResponse.StudyStatsResponse();
        stats.setTotalCards(totalCards);
        stats.setLearnedCards(learnedCards);
        stats.setDueToday(dueToday);
        stats.setNewToday(newToday);
        stats.setReviewToday(reviewToday);
        response.setStats(stats);

        return response;
    }

    public void reviewCard(Long userId, ReviewCardRequest request) {
        Card card = cardRepository
                .findById(request.getCardId())
                .orElseThrow(() -> new AppException(ErrorCode.CARD_NOT_FOUND));

        // Verify user has access to this card
        if (!card.getNote().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        // Process the review using spaced repetition algorithm
        spacedRepetitionService.processReview(
                request.getCardId(), userId, request.getRating(), request.getReviewTimeMs());
    }

    @Transactional(readOnly = true)
    public List<CardResponse> getCardsForDeck(Long deckId, Long userId) {
        List<Card> cards = cardRepository.findByDeckId(deckId);

        return cards.stream()
                .filter(card -> card.getNote().getUserId().equals(userId))
                .map(this::convertCardToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CardResponse getCardById(Long cardId, Long userId) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new AppException(ErrorCode.CARD_NOT_FOUND));

        if (!card.getNote().getUserId().equals(userId)) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        return convertCardToResponse(card);
    }

    private CardResponse convertCardToResponse(Card card) {
        CardResponse response = new CardResponse();
        response.setId(card.getId());
        response.setNoteId(card.getNoteId());
        response.setCardType(card.getCardType());
        response.setFrontTemplate(card.getFrontTemplate());
        response.setBackTemplate(card.getBackTemplate());
        response.setCreatedAt(card.getCreatedAt());

        // Get field values for template rendering
        Map<String, String> fieldValues = getFieldValuesForNote(card.getNoteId());
        response.setFieldValues(fieldValues);

        System.out.println("DEBUG: CardResponse fieldValues: " + fieldValues);
        System.out.println(
                "DEBUG: CardResponse fieldValues size: " + (fieldValues != null ? fieldValues.size() : "null"));

        // Get stats for this card
        CardStats stats = cardStatsRepository
                .findByCardIdAndUserId(card.getId(), card.getNote().getUserId())
                .orElse(null);
        if (stats != null) {
            CardResponse.CardStatsResponse statsResponse = new CardResponse.CardStatsResponse();
            statsResponse.setEaseFactor(stats.getEaseFactor());
            statsResponse.setIntervalDays(stats.getIntervalDays());
            statsResponse.setRepetitions(stats.getRepetitions());
            statsResponse.setLapses(stats.getLapses());
            statsResponse.setDueDate(stats.getDueDate());
            statsResponse.setLastReviewedAt(stats.getLastReviewedAt());
            response.setStats(statsResponse);
        }

        return response;
    }

    private Map<String, String> getFieldValuesForNote(Long noteId) {
        Map<String, String> fieldValues = new HashMap<>();
        List<NoteField> noteFields = noteFieldRepository.findByNoteId(noteId);

        for (NoteField noteField : noteFields) {
            Field field = fieldRepository.findById(noteField.getFieldId()).orElse(null);
            if (field != null) {
                fieldValues.put(field.getName(), noteField.getContent());
            }
        }

        return fieldValues;
    }

    private CardResponse convertCardStatsToResponse(CardStats cardStats) {
        Card card = cardStats.getCard();
        CardResponse response = convertCardToResponse(card);

        // Override stats with current values
        CardResponse.CardStatsResponse statsResponse = new CardResponse.CardStatsResponse();
        statsResponse.setEaseFactor(cardStats.getEaseFactor());
        statsResponse.setIntervalDays(cardStats.getIntervalDays());
        statsResponse.setRepetitions(cardStats.getRepetitions());
        statsResponse.setLapses(cardStats.getLapses());
        statsResponse.setDueDate(cardStats.getDueDate());
        statsResponse.setLastReviewedAt(cardStats.getLastReviewedAt());
        response.setStats(statsResponse);

        return response;
    }
}
