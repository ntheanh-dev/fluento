package com.nta;

import java.util.TimeZone;

import jakarta.annotation.PostConstruct;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableFeignClients
@EnableJpaAuditing
@EnableScheduling
public class FluentoApplication {

    public static void main(String[] args) {

        SpringApplication.run(FluentoApplication.class, args);
    }

    /** JDBC/JPA/Jackson: lưu và so sánh timestamp nhất quán UTC. Ngày nghiệp vụ dùng {@code app.time-zone}. */
    @PostConstruct
    public void init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
    }
}
