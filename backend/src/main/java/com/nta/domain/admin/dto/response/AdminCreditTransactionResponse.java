package com.nta.domain.admin.dto.response;

import java.time.LocalDateTime;

import com.nta.domain.creditTransaction.enums.CreditTransactionType;
import com.nta.domain.creditTransaction.enums.TransactionStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCreditTransactionResponse {
    private Long id;
    private Long userId;
    private String username;
    private Long amount;
    private CreditTransactionType type;
    private TransactionStatus status;
    private String referenceId;
    private LocalDateTime createdAt;
}
