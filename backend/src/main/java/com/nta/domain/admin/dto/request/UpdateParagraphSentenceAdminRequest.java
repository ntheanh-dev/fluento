package com.nta.domain.admin.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateParagraphSentenceAdminRequest {
    @NotBlank(message = "NOT_BLANK")
    private String content;
}
