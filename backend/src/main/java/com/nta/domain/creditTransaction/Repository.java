package com.nta.domain.creditTransaction;

import org.springframework.data.jpa.repository.JpaRepository;

@org.springframework.stereotype.Repository("creditTransactionRepository")
public interface Repository extends JpaRepository<CreditTransaction, Long> {}
