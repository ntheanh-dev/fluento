package com.nta.domain.userSentenceAnswer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentenceFeedback {
    private String correction;
    private java.util.List<String> suggestions;
    private String summary;
    private Double score;
}
