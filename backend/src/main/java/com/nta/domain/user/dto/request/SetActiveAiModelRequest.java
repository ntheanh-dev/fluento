package com.nta.domain.user.dto.request;

import jakarta.validation.constraints.NotNull;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Request to set the active AI model (aiModelId must belong to current active API key)")
public class SetActiveAiModelRequest {
    @NotNull
    private Long aiModelId;
}
