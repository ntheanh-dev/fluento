package com.nta.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nta.entity.CardStats;
import com.nta.entity.Review;
import com.nta.repository.CardStatsRepository;
import com.nta.repository.ReviewRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SpacedRepetitionService {

    private final CardStatsRepository cardStatsRepository;
    private final ReviewRepository reviewRepository;

    // SM-2 Algorithm constants
    private static final BigDecimal MIN_EASE_FACTOR = new BigDecimal("1.30");
    private static final BigDecimal INITIAL_EASE_FACTOR = new BigDecimal("2.50");
    private static final int INITIAL_INTERVAL = 1;
    private static final int SECOND_INTERVAL = 6;

    public void processReview(Long cardId, Long userId, Review.Rating rating, Long reviewTimeMs) {
        CardStats stats = cardStatsRepository
                .findByCardIdAndUserId(cardId, userId)
                .orElseGet(() -> createInitialStats(cardId, userId));

        // Create review record
        Review review = new Review();
        review.setCardId(cardId);
        review.setUserId(userId);
        review.setRating(rating);
        review.setReviewTimeMs(reviewTimeMs);
        review.setCreatedAt(LocalDateTime.now());

        // Calculate new interval and ease factor using SM-2 algorithm
        int newInterval = calculateNewInterval(stats, rating);
        BigDecimal newEaseFactor = calculateNewEaseFactor(stats, rating);

        // Update stats
        stats.setEaseFactor(newEaseFactor);
        stats.setIntervalDays(newInterval);
        stats.setRepetitions(stats.getRepetitions() + 1);
        stats.setLastReviewedAt(LocalDateTime.now());

        // Calculate due date
        LocalDateTime dueDate = LocalDateTime.now().plusDays(newInterval);
        stats.setDueDate(dueDate);

        // Update lapses if rating is AGAIN
        if (rating == Review.Rating.AGAIN) {
            stats.setLapses(stats.getLapses() + 1);
            stats.setRepetitions(0); // Reset repetitions for failed cards
        }

        // Set review values
        review.setEaseFactor(newEaseFactor);
        review.setIntervalDays(newInterval);
        review.setRepetitions(stats.getRepetitions());
        review.setDueDate(dueDate);

        // Save both records
        cardStatsRepository.save(stats);
        reviewRepository.save(review);
    }

    @Transactional(readOnly = true)
    public List<CardStats> getDueCards(Long userId) {
        return cardStatsRepository.findDueCardsForUser(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public List<CardStats> getTodayDueCards(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        return cardStatsRepository.findTodayDueCardsForUser(userId, now, startOfDay);
    }

    @Transactional(readOnly = true)
    public Long getDueCardsCount(Long userId) {
        return cardStatsRepository.countDueCardsForUser(userId, LocalDateTime.now());
    }

    @Transactional(readOnly = true)
    public Long getTotalCardsCount(Long userId) {
        return cardStatsRepository.countTotalCardsForUser(userId);
    }

    @Transactional(readOnly = true)
    public Long getTotalCardsCount(Long userId, Long deckId) {
        if (deckId == null) {
            return getTotalCardsCount(userId);
        }
        return cardStatsRepository.countTotalCardsForUserAndDeck(userId, deckId);
    }

    @Transactional(readOnly = true)
    public Long getLearnedCardsCount(Long userId) {
        return cardStatsRepository.countLearnedCardsForUser(userId);
    }

    @Transactional(readOnly = true)
    public Long getLearnedCardsCount(Long userId, Long deckId) {
        if (deckId == null) {
            return getLearnedCardsCount(userId);
        }
        return cardStatsRepository.countLearnedCardsForUserAndDeck(userId, deckId);
    }

    private CardStats createInitialStats(Long cardId, Long userId) {
        CardStats stats = new CardStats();
        stats.setCardId(cardId);
        stats.setUserId(userId);
        stats.setEaseFactor(INITIAL_EASE_FACTOR);
        stats.setIntervalDays(INITIAL_INTERVAL);
        stats.setRepetitions(0);
        stats.setLapses(0);
        stats.setDueDate(LocalDateTime.now());
        return cardStatsRepository.save(stats);
    }

    private int calculateNewInterval(CardStats stats, Review.Rating rating) {
        switch (rating) {
            case AGAIN:
                return INITIAL_INTERVAL; // Reset to 1 day
            case HARD:
                if (stats.getRepetitions() == 0) {
                    return INITIAL_INTERVAL;
                } else if (stats.getRepetitions() == 1) {
                    return SECOND_INTERVAL;
                } else {
                    return Math.max(1, (int)
                            (stats.getIntervalDays() * stats.getEaseFactor().doubleValue() * 0.8));
                }
            case GOOD:
                if (stats.getRepetitions() == 0) {
                    return INITIAL_INTERVAL;
                } else if (stats.getRepetitions() == 1) {
                    return SECOND_INTERVAL;
                } else {
                    return (int)
                            (stats.getIntervalDays() * stats.getEaseFactor().doubleValue());
                }
            case EASY:
                if (stats.getRepetitions() == 0) {
                    return SECOND_INTERVAL;
                } else if (stats.getRepetitions() == 1) {
                    return SECOND_INTERVAL * 4;
                } else {
                    return (int)
                            (stats.getIntervalDays() * stats.getEaseFactor().doubleValue() * 1.3);
                }
            default:
                return INITIAL_INTERVAL;
        }
    }

    private BigDecimal calculateNewEaseFactor(CardStats stats, Review.Rating rating) {
        BigDecimal currentEase = stats.getEaseFactor();

        switch (rating) {
            case AGAIN:
                return MIN_EASE_FACTOR;
            case HARD:
                return currentEase.subtract(new BigDecimal("0.15"));
            case GOOD:
                return currentEase; // No change
            case EASY:
                return currentEase.add(new BigDecimal("0.15"));
            default:
                return currentEase;
        }
    }
}
