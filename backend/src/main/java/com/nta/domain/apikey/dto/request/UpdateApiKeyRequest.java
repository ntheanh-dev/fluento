package com.nta.domain.apikey.dto.request;

import com.nta.domain.apikey.LimitPerDay;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApiKeyRequest {
    private LimitPerDay limitPerDay;
}
