package com.nta.domain.admin.dto.response;

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
public class AdminApiKeyResponse {
    private Long id;
    private String apiKey;
    private AiModelName model;
    private Integer credit;
    private boolean isActive;
    private LocalDateTime createdAt;

    private Long userId;
    private String username;
}
