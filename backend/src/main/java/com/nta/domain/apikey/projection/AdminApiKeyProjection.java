package com.nta.domain.apikey.projection;

import java.time.LocalDateTime;

import com.nta.domain.apikey.AiModelName;

public interface AdminApiKeyProjection {
    Long getId();

    String getApiKey();

    AiModelName getModel();

    Integer getCredit();

    Boolean getIsActive();

    LocalDateTime getCreatedAt();

    Long getUserId();

    String getUsername();
}
