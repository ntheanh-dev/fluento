package com.nta.domain.creditTransaction.enums;

public enum CreditTransactionType {
    AI_USAGE,
    TOP_UP,
    /** Đổi coin trong ví lấy credit (amount = credit nhận; referenceId = coin đã trả). */
    COIN_EXCHANGE,
    REFUND
}
