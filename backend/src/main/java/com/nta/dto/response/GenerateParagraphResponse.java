package com.nta.dto.response;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GenerateParagraphResponse {
    private String conversationId;
    private List<String> paragraphs;
}
