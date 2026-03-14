package com.nta.common.cron;

import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class CreditResetJob {

    private final com.nta.domain.apikey.Repository apiKeyRepository;
    private final com.nta.domain.user.Repository userRepository;

    private static final int CREDIT_PER_API_KEY_ROW = 20;

    /**
     * Reset toàn bộ credit: mỗi row ApiKey về 20, mỗi user về (số row ApiKey đang sở hữu) * 20.
     * Chạy mỗi ngày 00:00 UTC.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailyCreditsBasedOnApiKeys() {
        int apiKeyRowsReset = apiKeyRepository.resetAllCredits(CREDIT_PER_API_KEY_ROW);
        log.info("Daily credit reset - {} api key rows set to {}", apiKeyRowsReset, CREDIT_PER_API_KEY_ROW);

        List<Object[]> rows = apiKeyRepository.countByUser();
        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            Long apiKeyCount = (Long) row[1];
            int credits = apiKeyCount.intValue() * CREDIT_PER_API_KEY_ROW;
            userRepository.setCredits(userId, credits);
            log.info("Daily credit reset - userId={} apiKeyCount={} userCredits={}", userId, apiKeyCount, credits);
        }

        userRepository.resetCreditsForUsersWithoutApiKeys();
    }
}
