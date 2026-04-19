package com.nta.domain.user.dto.request;

import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Request body (JSON part "profile") for PUT /users/me.
 * Single endpoint for updating fullName and/or update/create password; all fields are optional.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Schema(description = "Profile part for PUT /users/me: optional fullName and/or password (update or create)")
public class UpdateMeRequest {

    @Schema(description = "Full name", example = "John Doe")
    @Size(max = 255, message = "FULL_NAME_INVALID")
    String fullName;

    @Schema(description = "Current password (required only when user already has a password and newPassword is set)")
    String currentPassword;

    @Schema(
            description = "New password for update, or first password for create (8–20 characters)",
            example = "newpassword123")
    @Size(min = 8, max = 20, message = "VALIDATION_PASSWORD_INVALID")
    String newPassword;
}
