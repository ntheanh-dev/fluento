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
import com.nta.domain.admin.dto.response.AdminCreditTransactionResponse;
import com.nta.domain.creditTransaction.CreditTransaction;
import com.nta.domain.creditTransaction.Repository;

import lombok.RequiredArgsConstructor;

@RestController("adminCreditTransactionController")
@RequestMapping("/admin/credit-transactions")
@RequiredArgsConstructor
public class AdminCreditTransactionController {

    private final Repository creditTransactionRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Page<AdminCreditTransactionResponse>> list(
            @RequestParam(required = false) Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<CreditTransaction> pageResult = userId != null
                ? creditTransactionRepository.findByUser_Id(userId, pageable)
                : creditTransactionRepository.findAll(pageable);

        List<AdminCreditTransactionResponse> content =
                pageResult.getContent().stream().map(this::toResponse).collect(Collectors.toList());

        Page<AdminCreditTransactionResponse> response =
                new PageImpl<>(content, pageResult.getPageable(), pageResult.getTotalElements());

        return ApiResponse.<Page<AdminCreditTransactionResponse>>builder()
                .result(response)
                .build();
    }

    private AdminCreditTransactionResponse toResponse(CreditTransaction tx) {
        Long ownerId = tx.getUser() != null ? tx.getUser().getId() : null;
        String username = tx.getUser() != null ? tx.getUser().getUsername() : null;

        return AdminCreditTransactionResponse.builder()
                .id(tx.getId())
                .userId(ownerId)
                .username(username)
                .amount(tx.getAmount())
                .type(tx.getType())
                .status(tx.getStatus())
                .referenceId(tx.getReferenceId())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
