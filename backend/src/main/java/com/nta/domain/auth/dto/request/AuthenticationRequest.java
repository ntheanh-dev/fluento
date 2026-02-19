package com.nta.domain.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    @Schema(description = "Username", example = "john_doe", defaultValue = "")
    String username;
    
    @Schema(description = "Password", example = "password123", defaultValue = "")
    String password;
}
