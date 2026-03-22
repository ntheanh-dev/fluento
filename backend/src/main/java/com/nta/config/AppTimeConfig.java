package com.nta.config;

import java.time.ZoneId;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Múi giờ nghiệp vụ (ngày streak, thống kê theo ngày, cron reset credit).
 * Lưu DB/Jackson vẫn dùng UTC; chỉ dùng {@link #appZoneId} khi cần "ngày" theo locale app.
 */
@Configuration
public class AppTimeConfig {

    @Bean
    public ZoneId appZoneId(@Value("${app.time-zone:Asia/Ho_Chi_Minh}") String zoneId) {
        return ZoneId.of(zoneId);
    }
}
