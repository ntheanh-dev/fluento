package com.nta.domain.sentence.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SentenceCreationRequest {
    @Schema(description = "Conversation ID", example = "conv-123", defaultValue = "")
    String conversationId;
    
    @Schema(description = "Vietnamese sentence", example = "Xin chào", defaultValue = "")
    String vietnamese;
    
    @Schema(description = "English translation", example = "Hello", defaultValue = "")
    String englishTranslation;
    
    @Schema(description = "Order index", example = "1", defaultValue = "0")
    Integer orderIndex;
    
    @Schema(description = "Score", example = "8", defaultValue = "0")
    Integer score;
    
    @Schema(description = "Feedback", example = "Good translation", defaultValue = "")
    String feedback;
}
