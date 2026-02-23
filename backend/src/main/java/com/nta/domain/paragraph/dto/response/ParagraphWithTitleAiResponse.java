package com.nta.domain.paragraph.dto.response;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ParagraphWithTitleAiResponse {
    String title;
    String content;
}
