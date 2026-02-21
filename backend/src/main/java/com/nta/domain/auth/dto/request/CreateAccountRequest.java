package com.nta.domain.auth.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAccountRequest {
    @Schema(description = "Username (8-20 characters)", example = "john_doe", defaultValue = "")
    @NotBlank(message = "NOT_BLANK")
    @Size(min = 8, max = 20, message = "USERNAME_INVALID")
    @NotNull(message = "NOT_NULL")
    String username;

    @Schema(description = "Full name", example = "John Doe", defaultValue = "")
    @Size(max = 255, message = "FULL_NAME_INVALID")
    String fullName;

    @Schema(description = "Password (8-20 characters)", example = "password123", defaultValue = "")
    @Size(min = 8, max = 20, message = "VALIDATION_PASSWORD_INVALID")
    @NotBlank(message = "NOT_BLANK")
    @NotNull(message = "NOT_NULL")
    String password;

    @Schema(description = "Email address", example = "john.doe@example.com", defaultValue = "")
    @Email(regexp = ".+[@].+[\\.].+", message = "EMAIL_INVALID")
    String email;
}
