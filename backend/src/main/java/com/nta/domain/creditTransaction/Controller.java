package com.nta.domain.creditTransaction;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nta.common.dto.ApiResponse;
import com.nta.domain.creditTransaction.dto.response.MyCreditTransactionItemResponse;

import lombok.RequiredArgsConstructor;

@RestController("creditTransactionController")
@RequestMapping("/credit-transactions")
@RequiredArgsConstructor
public class Controller {

    private final Service service;

    @GetMapping
    ApiResponse<Page<MyCreditTransactionItemResponse>> getMyTransactions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ApiResponse.<Page<MyCreditTransactionItemResponse>>builder()
                .result(service.getMyTransactions(page, size, sortBy, sortDir))
                .build();
    }
}
