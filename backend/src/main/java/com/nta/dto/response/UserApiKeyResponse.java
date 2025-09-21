package com.nta.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserApiKeyResponse {
    private String provider;
    private boolean present;
}
