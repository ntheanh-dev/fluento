package com.nta.domain.creditTransaction;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("creditTransactionRepository")
public interface Repository extends JpaRepository<CreditTransaction, Long> {
    Page<CreditTransaction> findByUser_Id(Long userId, Pageable pageable);
}
