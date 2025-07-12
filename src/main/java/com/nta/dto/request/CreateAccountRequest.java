package com.nta.dto.request;

import jakarta.validation.constraints.Size;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CreateAccountRequest {
    String username;
    // @Size(message=Errorcode.PASSWORD_INVALID.getMessage())
    // Không thể truyền như vậy do bắt buộc phải truyền vào một constanins
    // => Truyền vào một ENUM NAME và trong handler lấy ra Errorcode tướng ứng
    @Size(min = 8, message = "PASSWORD_INVALID")
    String password;

    String email;
}
