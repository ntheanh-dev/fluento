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

    /**
     * Reset daily credits for all users based on the total number of ApiKey rows they own.
     * Runs every day at 00:00 UTC.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "UTC")
    @Transactional
    public void resetDailyCreditsBasedOnApiKeys() {
        List<Object[]> rows = apiKeyRepository.countByUser();

        for (Object[] row : rows) {
            Long userId = (Long) row[0];
            Long apiKeyCount = (Long) row[1];
            long credits = apiKeyCount * 20L;
            userRepository.setCredits(userId, credits);
            log.info("Daily credit reset - userId={} apiKeyCount={} credits={}", userId, apiKeyCount, credits);
        }

        userRepository.resetCreditsForUsersWithoutApiKeys();
    }
}
