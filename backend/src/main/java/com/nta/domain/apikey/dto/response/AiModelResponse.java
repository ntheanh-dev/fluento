package com.nta.domain.apikey.dto.response;

import java.time.LocalDateTime;

import com.nta.domain.apikey.AiModelName;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiModelResponse {
    private Long id;
    private String apiKey;

    private AiModelName model;
    private Integer credit;

    private LocalDateTime createdAt;
}
