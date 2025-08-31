package com.nta.dto.request;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
@JsonNaming(PropertyNamingStrategy.SnakeCaseStrategy.class)
public class GoogleExchangeTokenRq {
    String code;
    String clientId;
    String clientSecret;
    String redirectUri;
    String grantType;
}
