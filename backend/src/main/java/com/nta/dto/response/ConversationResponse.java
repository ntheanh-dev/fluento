package com.nta.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ConversationResponse {
    private List<String> sentences; //vietnamese sentences
    private List<String> englishTranslations;
}
