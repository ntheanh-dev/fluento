package com.nta.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class GenerateParagraphResponse {
    private String conversationId;
    private List<String> paragraphs;
}
