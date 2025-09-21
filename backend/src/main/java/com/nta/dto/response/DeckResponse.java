package com.nta.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DeckResponse {

    private Long id;
    private String name;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long noteCount;
    private Long cardCount;
}
