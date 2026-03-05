package com.nta.domain.user;

import java.time.LocalDate;
import java.time.ZoneOffset;

import jakarta.transaction.Transactional;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserStreakScheduler {

    private final Repository repository;

    /**
     * Reset current streak về 0 cho các user không luyện tập trong ngày hôm qua.
     * Chạy lúc 00:00 UTC mỗi ngày.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void resetBrokenStreaks() {
        LocalDate yesterday = LocalDate.now(ZoneOffset.UTC).minusDays(1);
        int affected = repository.resetBrokenStreaks(yesterday);
        log.info("Reset {} user streaks for users inactive since before {}", affected, yesterday);
    }
}
