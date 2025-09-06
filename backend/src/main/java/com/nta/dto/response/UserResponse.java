package com.nta.dto.response;

import java.util.Set;

import com.nta.entity.Role;

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
    String urlAvatar;
    Boolean noPassword;
    Set<Role> roles;
}
