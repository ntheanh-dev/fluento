package com.nta.domain.apikey;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.apikey.dto.request.CreateApiKeyRequest;
import com.nta.domain.apikey.dto.request.DeleteApiKeyRequest;
import com.nta.domain.apikey.dto.response.AiModelResponse;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController("apiKeyController")
@RequestMapping("/api-keys")
@Tag(name = "API Key", description = "API key + model")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class Controller {

    Service service;

    @PostMapping
    ApiResponse<List<AiModelResponse>> create(@RequestBody @Valid CreateApiKeyRequest request) {
        log.debug("Create API key requested");
        return ApiResponse.<List<AiModelResponse>>builder()
                .result(service.create(request))
                .message("API key created successfully (3 models)")
                .build();
    }

    @DeleteMapping
    ApiResponse<Void> delete(@RequestBody @Valid DeleteApiKeyRequest request) {
        service.delete(request);
        return ApiResponse.<Void>builder()
                .message("API key deleted successfully")
                .build();
    }
}
