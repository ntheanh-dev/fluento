package com.nta.dto.response;

import com.nta.entity.Role;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    Long id;
    String username;
    String urlAvatar;
    Boolean noPassword;
    Set<Role> roles;
}
