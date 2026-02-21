package com.nta.domain.user.dto.response;

import java.util.List;

import com.nta.domain.apikey.dto.response.AiModelResponse;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Phần embedded trong GET /me?embedded=... */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMeEmbeddedResponse {
    /** Danh sách API key (flat, mỗi row = key + model), apiKey đã decrypt. */
    private List<AiModelResponse> apiKey;
}
