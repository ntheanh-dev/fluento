package com.nta.common.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.nta.common.client.dto.GeminiModelsResponse;

@FeignClient(name = "geminiApiClient", url = "https://generativelanguage.googleapis.com")
public interface GeminiApiClient {

    /**
     * List available models. Dùng để kiểm tra API key hợp lệ (200 = hợp lệ, 401/403 = không hợp lệ).
     */
    @GetMapping("/v1beta/models")
    GeminiModelsResponse listModels(@RequestParam("key") String apiKey);
}
