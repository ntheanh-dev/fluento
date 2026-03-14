package com.nta.common.client.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class GeminiModelsResponse {

    private List<ModelInfo> models;

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ModelInfo {
        private String name;
    }
}
