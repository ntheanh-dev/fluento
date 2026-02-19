package com.nta.domain.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordCreationRequest {
    @Schema(description = "Password (minimum 8 characters)", example = "password123", defaultValue = "")
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;
}
