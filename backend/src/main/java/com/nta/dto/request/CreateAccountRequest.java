package com.nta.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAccountRequest {
    @NotBlank(message = "NOT_BLANK")
    @Size(min = 8, max = 20, message = "USERNAME_INVALID")
    @NotNull(message = "NOT_NULL")
    String username;
    // @Size(message=Errorcode.PASSWORD_INVALID.getMessage())
    // Không thể truyền như vậy do bắt buộc phải truyền vào một constanins
    // => Truyền vào một ENUM NAME và trong handler lấy ra Errorcode tướng ứng
    @Size(min = 8, max = 20, message = "PASSWORD_INVALID")
    @NotBlank(message = "NOT_BLANK")
    @NotNull(message = "NOT_NULL")
    String password;

    @Email(regexp = ".+[@].+[\\.].+", message = "EMAIL_INVALID")
    String email;
}
