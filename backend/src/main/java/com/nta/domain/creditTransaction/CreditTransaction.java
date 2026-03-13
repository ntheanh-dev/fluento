package com.nta.domain.creditTransaction;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.nta.domain.creditTransaction.enums.CreditTransactionType;
import com.nta.domain.creditTransaction.enums.TransactionStatus;
import com.nta.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "credit_transactions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private Long amount;

    @Enumerated(EnumType.STRING)
    private CreditTransactionType type;

    @Enumerated(EnumType.STRING)
    private TransactionStatus status;

    private String referenceId;

    private LocalDateTime createdAt = LocalDateTime.now();
}
