package com.nta.domain.admin.dto.request;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Admin updates allowed fields for a target user. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserAdminRequest {
    private String fullName;
    private Integer credits;

    /** Role names to assign to the user (e.g. ["ADMIN", "USER"]). */
    private List<String> roleNames;

    /** ID of a row in api_keys (one row = api key + one model). */
    private Long activeApiKeyId;
}
