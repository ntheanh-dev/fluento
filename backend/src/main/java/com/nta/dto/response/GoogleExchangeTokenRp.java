package com.nta.dto.response;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class GoogleExchangeTokenRp {
    String accessToken;
    String expiresIn; // Duration in seconds
    String refreshToken;
    String refreshTokenExpiresIn;
    String scope;
    String tokenType; // Typically "Bearer"
}
