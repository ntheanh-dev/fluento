package com.nta.domain.admin.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.admin.dto.response.AdminApiKeyResponse;
import com.nta.domain.apikey.Repository;
import com.nta.domain.apikey.Service;
import com.nta.domain.apikey.dto.request.CreateApiKeyRequest;
import com.nta.domain.apikey.dto.request.UpdateApiKeyRequest;
import com.nta.domain.apikey.projection.AdminApiKeyProjection;

import lombok.RequiredArgsConstructor;

@RestController("adminApiKeyController")
@RequestMapping("/admin/api-keys")
@RequiredArgsConstructor
public class AdminApiKeyController {

    private final Service apiKeyService;
    private final Repository apiKeyRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<AdminApiKeyResponse>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<AdminApiKeyProjection> pageResult = userId != null
                ? apiKeyRepository.findAdminApiKeysByUserId(userId, pageable)
                : apiKeyRepository.findAdminApiKeys(pageable);

        List<AdminApiKeyResponse> content =
                pageResult.getContent().stream().map(this::toAdminResponse).collect(Collectors.toList());

        Page<AdminApiKeyResponse> resultPage =
                new PageImpl<>(content, pageResult.getPageable(), pageResult.getTotalElements());

        return ApiResponse.<Page<AdminApiKeyResponse>>builder()
                .result(resultPage)
                .build();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<?> createForUser(@RequestParam Long userId, @RequestBody CreateApiKeyRequest request) {
        return ApiResponse.builder()
                .result(apiKeyService.createForUser(request, userId))
                .message("API key created successfully (3 models)")
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> updateCredit(@PathVariable Long id, @RequestBody UpdateApiKeyRequest request) {
        if (request.getCredit() == null) {
            throw new AppException(ErrorCode.NOT_NULL);
        }
        apiKeyService.updateCreditForAdmin(id, request.getCredit());
        return ApiResponse.<Void>builder().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        apiKeyService.deleteForAdmin(id);
        return ApiResponse.<Void>builder().build();
    }

    private AdminApiKeyResponse toAdminResponse(AdminApiKeyProjection row) {
        return AdminApiKeyResponse.builder()
                .id(row.getId())
                .apiKey(row.getApiKey())
                .model(row.getModel())
                .credit(row.getCredit())
                .isActive(Boolean.TRUE.equals(row.getIsActive()))
                .createdAt(row.getCreatedAt())
                .userId(row.getUserId())
                .username(row.getUsername())
                .build();
    }
}
