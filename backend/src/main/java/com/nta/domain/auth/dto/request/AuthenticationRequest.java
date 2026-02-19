package com.nta.domain.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    @Schema(description = "Username", example = "john_doe", defaultValue = "")
    @NotBlank(message = "Username cannot be blank")
    @Size(min = 8, max = 20, message = "USERNAME_INVALID")
    @NotNull(message = "Username cannot be null")
    String username;

    @Schema(description = "Password", example = "password123", defaultValue = "")
    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 20, message = "VALIDATION_PASSWORD_INVALID")
    @NotNull(message = "Password cannot be null")
    String password;
}
