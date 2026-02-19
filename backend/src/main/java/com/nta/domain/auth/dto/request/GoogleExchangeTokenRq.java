package com.nta.domain.auth.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class GoogleExchangeTokenRq {
    @Schema(description = "Authorization code from Google", example = "4/0AeanS...", defaultValue = "")
    String code;
    
    @Schema(description = "Client ID", example = "your-client-id", defaultValue = "")
    String clientId;
    
    @Schema(description = "Client secret", example = "your-client-secret", defaultValue = "")
    String clientSecret;
    
    @Schema(description = "Redirect URI", example = "http://localhost:1234/oauth/authenticate", defaultValue = "")
    String redirectUri;
    
    @Schema(description = "Grant type", example = "authorization_code", defaultValue = "authorization_code")
    String grantType;
}
