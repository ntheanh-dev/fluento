package com.nta.domain.admin.controller;

import java.util.Set;
import java.util.stream.Collectors;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.nta.common.dto.ApiResponse;
import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.admin.dto.request.UpdateUserAdminRequest;
import com.nta.domain.apikey.ApiKey;
import com.nta.domain.role.Role;
import com.nta.domain.user.Repository;
import com.nta.domain.user.dto.response.UserResponse;

import lombok.RequiredArgsConstructor;

/**
 * Admin user management: list / update roles+credits / delete.
 *
 * NOTE: Endpoints are protected by ADMIN role.
 */
@RestController("adminUserController")
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@Transactional
public class AdminUserController {

    private final Repository userRepository;
    private final com.nta.domain.user.Mapper userMapper;
    private final com.nta.domain.role.Repository roleRepository;
    private final com.nta.domain.apikey.Repository apiKeyRepository;
    private final com.nta.domain.userPractice.Repository userPracticeRepository;
    private final com.nta.domain.creditTransaction.Repository creditTransactionRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<UserResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {

        // No keyword search implementation exists today; keep it simple.
        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<com.nta.domain.user.User> users = userRepository.findAll(pageable);

        Page<UserResponse> response = new PageImpl<>(
                users.getContent().stream().map(userMapper::toUserResponse).collect(Collectors.toList()),
                users.getPageable(),
                users.getTotalElements());

        return ApiResponse.<Page<UserResponse>>builder().result(response).build();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> get(@PathVariable Long id) {
        com.nta.domain.user.User user =
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));
        return ApiResponse.<UserResponse>builder()
                .result(userMapper.toUserResponse(user))
                .build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<UserResponse> update(@PathVariable Long id, @RequestBody UpdateUserAdminRequest request) {
        com.nta.domain.user.User user =
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        if (request.getFullName() != null) {
            String trimmed = request.getFullName().trim();
            user.setFullName(trimmed.isEmpty() ? null : trimmed);
        }
        if (request.getCredits() != null) {
            user.setCredits(request.getCredits());
        }
        if (request.getRoleNames() != null) {
            Set<Role> roles = request.getRoleNames().stream()
                    .map(name -> roleRepository
                            .findById(name)
                            .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND)))
                    .collect(Collectors.toSet());
            user.setRoles(roles);
        }
        if (request.getActiveApiKeyId() != null) {
            ApiKey apiKey = apiKeyRepository
                    .findByIdAndUserId(request.getActiveApiKeyId(), id)
                    .orElseThrow(() -> new AppException(ErrorCode.PROVIDER_API_KEY_NOT_FOUND));
            user.setActiveApiKeyId(apiKey.getId());
        }

        com.nta.domain.user.User saved = userRepository.save(user);
        return ApiResponse.<UserResponse>builder()
                .result(userMapper.toUserResponse(saved))
                .build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        com.nta.domain.user.User user =
                userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND));

        // Detach API keys to avoid FK issues (api_keys.user_id is nullable=true).
        apiKeyRepository.findByUserIdOrderByCreatedAtAsc(id).forEach(row -> {
            row.setCredit(0);
            row.setActive(false);
            row.setUser(null);
            apiKeyRepository.save(row);
        });

        // Delete user practices (cascade will remove sentenceAnswers).
        userPracticeRepository.findByUserId(id).forEach(userPracticeRepository::delete);

        // Delete credit transactions.
        creditTransactionRepository.deleteAll(creditTransactionRepository.findAll().stream()
                .filter(tx -> tx.getUser() != null && tx.getUser().getId().equals(id))
                .collect(Collectors.toList()));

        userRepository.delete(user);
        return ApiResponse.<Void>builder().build();
    }
}
