package com.nta.domain.creditTransaction;

import jakarta.transaction.Transactional;

import com.nta.common.enums.ErrorCode;
import com.nta.common.exception.AppException;
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
}
