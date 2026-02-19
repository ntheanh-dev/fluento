package com.nta.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class ChangePasswordRequest {

    @Schema(description = "Current password", example = "oldpassword123", defaultValue = "")
    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    private String currentPassword;

    @Schema(description = "New password (minimum 8 characters)", example = "newpassword123", defaultValue = "")
    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, message = "Mật khẩu mới phải có ít nhất 8 ký tự")
    private String newPassword;
}
