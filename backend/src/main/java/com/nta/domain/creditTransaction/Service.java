package com.nta.domain.creditTransaction;

import java.util.Set;

import jakarta.transaction.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
import com.nta.domain.creditTransaction.dto.response.MyCreditTransactionItemResponse;
import com.nta.domain.creditTransaction.enums.CreditTransactionType;
import com.nta.domain.creditTransaction.enums.TransactionStatus;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@org.springframework.stereotype.Service("creditTransactionService")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class Service {
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("type", "amount", "status", "createdAt");

    com.nta.domain.user.Repository userRepository;
    com.nta.common.service.CommonUserService commonUserService;
    Repository transactionRepository;

    @Transactional
    public CreditTransaction reserveCredit(Long userId, Long amount) {
        int updated = userRepository.reserveCredits(userId, amount.intValue());

        if (updated == 0) {
            throw new AppException(ErrorCode.NOT_ENOUGH_CREDITS);
        }

        CreditTransaction tx = new CreditTransaction();
        tx.setUser(User.builder().id(userId).build());
        tx.setAmount(-amount);
        tx.setType(CreditTransactionType.AI_USAGE);
        tx.setStatus(TransactionStatus.PENDING);

        return transactionRepository.save(tx);
    }

    @Transactional
    public void commitTransaction(Long transactionId) {

        CreditTransaction tx = transactionRepository.findById(transactionId).orElseThrow();

        tx.setStatus(TransactionStatus.SUCCESS);
    }

    @Transactional
    public void refundTransaction(Long transactionId) {

        CreditTransaction tx = transactionRepository.findById(transactionId).orElseThrow();

        Long ownerId = tx.getUser().getId();

        Long currentUserId = commonUserService.getCurrentUserIdFromContext();
        if (!ownerId.equals(currentUserId)) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        userRepository.addCredits(ownerId, Math.abs(tx.getAmount().intValue()));

        tx.setStatus(TransactionStatus.FAILED);
    }

    /**
     * Ghi nhận giao dịch đổi coin → credit (số dư đã cập nhật ở tầng gọi).
     *
     * @param creditsGained số credit cộng vào tài khoản (dương)
     * @param coinsSpent      số coin đã trừ (lưu trong referenceId để đối soát)
     */
    public void recordCoinExchange(Long userId, long creditsGained, int coinsSpent) {
        CreditTransaction tx = new CreditTransaction();
        tx.setUser(User.builder().id(userId).build());
        tx.setAmount(creditsGained);
        tx.setType(CreditTransactionType.COIN_EXCHANGE);
        tx.setStatus(TransactionStatus.SUCCESS);
        tx.setReferenceId("coins_spent=" + coinsSpent);
        transactionRepository.save(tx);
        log.info(
                "Recorded COIN_EXCHANGE tx for user {}: +{} credits ({} coins spent)",
                userId,
                creditsGained,
                coinsSpent);
    }

    public Page<MyCreditTransactionItemResponse> getMyTransactions(int page, int size, String sortBy, String sortDir) {
        Long userId = commonUserService.getCurrentUserIdFromContext();
        String normalizedSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, normalizedSortBy));
        Page<CreditTransaction> transactions = transactionRepository.findByUser_Id(userId, pageable);

        return new PageImpl<>(
                transactions.getContent().stream()
                        .map(tx -> MyCreditTransactionItemResponse.builder()
                                .id(tx.getId())
                                .amount(tx.getAmount())
                                .type(tx.getType())
                                .status(tx.getStatus())
                                .referenceId(tx.getReferenceId())
                                .createdAt(tx.getCreatedAt())
                                .build())
                        .toList(),
                transactions.getPageable(),
                transactions.getTotalElements());
    }
}
