package com.nta.domain.user.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

import com.nta.domain.role.Role;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    Long id;
    String username;
    String fullName;
    String urlAvatar;
    Boolean noPassword;
    Set<Role> roles;
    LocalDateTime createdAt;
    Long activeApiKeyId;
    /** Điền khi GET /me?embedded=... (vd: embedded=apiKey → embedded.apiKey = [...]) */
    UserMeEmbeddedResponse embedded;
}
