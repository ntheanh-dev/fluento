package com.nta.common.cron;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Reset credit người dùng theo ngày (hạn mức miễn phí), không còn phụ thuộc bảng api_keys.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CreditResetJob {

    private final com.nta.domain.user.Repository userRepository;

    @Value("${app.credits.daily-reset:30}")
    private int dailyResetCredits;

    @Scheduled(cron = "0 0 0 * * *", zone = "${app.time-zone:Asia/Ho_Chi_Minh}")
    @Transactional
    public void resetDailyUserCredits() {
        int updated = userRepository.setAllUsersCredits(dailyResetCredits);
        log.info("Daily credit reset: {} users set to {} credits", updated, dailyResetCredits);
    }
}
