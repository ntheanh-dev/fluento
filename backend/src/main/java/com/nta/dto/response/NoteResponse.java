package com.nta.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.nta.entity.Card;

import lombok.Data;

@Data
public class NoteResponse {

    private Long id;
    private Long noteTypeId;
    private Long deckId;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, String> fieldValues;
    private List<CardResponse> cards;
    private LocalDateTime due;

    @Data
    public static class CardResponse {
        private Long id;
        private Card.CardType cardType;
        private String frontTemplate;
        private String backTemplate;
        private LocalDateTime createdAt;
    }
}
