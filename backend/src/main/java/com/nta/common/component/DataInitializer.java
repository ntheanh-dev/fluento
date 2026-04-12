package com.nta.common.component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.nta.common.constant.PredefinedRole;
import com.nta.domain.paragraph.Paragraph;
import com.nta.domain.paragraph.dto.request.CreateParagraphRequest;
import com.nta.domain.paragraph.enums.Level;
import com.nta.domain.paragraph.enums.SentenceCount;
import com.nta.domain.paragraph.enums.Tone;
import com.nta.domain.paragraph.enums.Topic;
import com.nta.domain.paragraph.enums.Type;
import com.nta.domain.role.Role;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DataInitializer {

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner init(
            com.nta.domain.role.Repository roleRepository,
            com.nta.domain.user.Repository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("DataInitializer: Application started, performing initialization...");

            if (roleRepository.findByName(PredefinedRole.USER_ROLE) == null) {
                roleRepository.save(
                        Role.builder().name(PredefinedRole.USER_ROLE).build());
            }

            if (roleRepository.findByName(PredefinedRole.ADMIN_ROLE) == null) {
                roleRepository.save(
                        Role.builder().name(PredefinedRole.ADMIN_ROLE).build());
            }

            if (userRepository.findByUsername("admin123456").isEmpty()) {
                HashSet<Role> roles = new HashSet<>();
                roleRepository.findById(PredefinedRole.ADMIN_ROLE).ifPresent(roles::add);
                userRepository.save(User.builder()
                        .username("admin123456")
                        .password(passwordEncoder.encode("admin123"))
                        .credits(100)
                        .roles(roles)
                        .build());
            }
        };
    }

    @Configuration
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    @Slf4j
    static class LocalParagraphSeed {

        @Bean
        @ConditionalOnProperty(name = "app.data-init.paragraphs.enabled", havingValue = "true")
        ApplicationRunner initParagraphsFromAi(
                com.nta.domain.paragraph.Service paragraphService,
                @Value("${app.data-init.paragraphs.max-retries-per-item:5}") int maxRetriesPerItem,
                @Value("${app.data-init.paragraphs.parallelism:4}") int parallelism) {
            return args -> runParagraphAiSeed(paragraphService, maxRetriesPerItem, parallelism);
        }

        /**
         * One task per (type, level, topic, tone, sentenceCount). Uses {@link com.nta.domain.paragraph.Service#findOrcreate}
         * so an existing paragraph with the same setup is reused — no second row for the same combo. Parallelism is
         * capped by {@code parallelism} (fixed pool).
         */
        private void runParagraphAiSeed(
                com.nta.domain.paragraph.Service paragraphService, int maxRetriesPerItem, int parallelism) {
            int poolSize = Math.max(1, parallelism);
            AtomicInteger done = new AtomicInteger();
            AtomicInteger failed = new AtomicInteger();

            List<Callable<Void>> tasks = new ArrayList<>();
            for (Type type : Type.values()) {
                if (type == Type.SINGLE_SENTENCE) {
                    continue;
                }
                for (Level level : Level.values()) {
                    for (Topic topic : Topic.values()) {
                        for (Tone tone : Tone.values()) {
                            for (SentenceCount sentenceCount : SentenceCount.values()) {
                                CreateParagraphRequest request = CreateParagraphRequest.builder()
                                        .type(type)
                                        .level(level)
                                        .topic(topic)
                                        .tone(tone)
                                        .sentenceCount(sentenceCount)
                                        .build();
                                tasks.add(() -> {
                                    Paragraph saved = findOrCreateWithRetries(
                                            paragraphService,
                                            request,
                                            type,
                                            level,
                                            topic,
                                            tone,
                                            sentenceCount,
                                            maxRetriesPerItem);
                                    if (saved != null) {
                                        done.incrementAndGet();
                                        log.info(
                                                "Paragraph AI init: id={} type={} level={} topic={} tone={} sentences={}",
                                                saved.getId(),
                                                type,
                                                level,
                                                topic,
                                                tone,
                                                sentenceCount);
                                    } else {
                                        failed.incrementAndGet();
                                    }
                                    return null;
                                });
                            }
                        }
                    }
                }
            }

            if (tasks.isEmpty()) {
                log.info("Paragraph AI init: no tasks (empty type set?)");
                return;
            }

            ExecutorService executor = Executors.newFixedThreadPool(poolSize);
            try {
                List<Future<Void>> futures = executor.invokeAll(tasks);
                for (Future<Void> future : futures) {
                    try {
                        future.get();
                    } catch (ExecutionException e) {
                        failed.incrementAndGet();
                        log.error("Paragraph AI init task failed", e.getCause());
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Paragraph AI init interrupted", e);
            } finally {
                executor.shutdown();
                try {
                    if (!executor.awaitTermination(7, TimeUnit.DAYS)) {
                        executor.shutdownNow();
                    }
                } catch (InterruptedException e) {
                    executor.shutdownNow();
                    Thread.currentThread().interrupt();
                }
            }
            log.info("Paragraph AI init finished: created={}, failed={}", done.get(), failed.get());
        }

        private Paragraph findOrCreateWithRetries(
                com.nta.domain.paragraph.Service paragraphService,
                CreateParagraphRequest request,
                Type type,
                Level level,
                Topic topic,
                Tone tone,
                SentenceCount sentenceCount,
                int maxRetriesPerItem) {
            Exception last = null;
            for (int attempt = 1; attempt <= maxRetriesPerItem; attempt++) {
                try {
                    return paragraphService.findOrcreate(request);
                } catch (Exception e) {
                    last = e;
                    log.warn(
                            "Paragraph AI init attempt {}/{} type={} level={} topic={} tone={} sentences={}: {}",
                            attempt,
                            maxRetriesPerItem,
                            type,
                            level,
                            topic,
                            tone,
                            sentenceCount,
                            e.getMessage());
                }
            }
            log.error(
                    "Paragraph AI init gave up after {} attempts type={} level={} topic={} tone={} sentences={}",
                    maxRetriesPerItem,
                    type,
                    level,
                    topic,
                    tone,
                    sentenceCount,
                    last);
            return null;
        }
    }
}
