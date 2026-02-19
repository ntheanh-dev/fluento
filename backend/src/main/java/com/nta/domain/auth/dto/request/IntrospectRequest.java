package com.nta.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class IntrospectRequest {
    @Schema(description = "Token to introspect", example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", defaultValue = "")
    @NotBlank(message = "Token cannot be blank")
    @NotNull(message = "Token cannot be null")
    String token;
}
