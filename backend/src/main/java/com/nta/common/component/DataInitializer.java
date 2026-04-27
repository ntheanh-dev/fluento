package com.nta.common.component;

import java.util.ArrayList;
import java.util.Arrays;
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
import com.nta.domain.paragraphSentence.ParagraphSentence;
import com.nta.domain.paragraphSentenceHint.ParagraphSentenceHint;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;
import com.nta.domain.role.Role;
import com.nta.domain.user.User;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class DataInitializer {

    @Bean
    @ConditionalOnProperty(
            prefix = "spring",
            value = "datasource.driverClassName",
            havingValue = "com.mysql.cj.jdbc.Driver")
    ApplicationRunner init(
            com.nta.domain.role.Repository roleRepository,
            com.nta.domain.user.Repository userRepository,
            com.nta.domain.paragraph.Repository paragraphRepository,
            @Value("${app.data-init.paragraph-sentence-fixer.enabled:false}") boolean paragraphSentenceFixerEnabled,
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
                        .coins(0)
                        .roles(roles)
                        .build());
            }

            if (paragraphSentenceFixerEnabled) {
                fixParagraphSentences(paragraphRepository);
            }
        };
    }

    private void fixParagraphSentences(com.nta.domain.paragraph.Repository paragraphRepository) {
        for (var paragraph : paragraphRepository.findAll()) {
            if (paragraph.getType() == Type.EMAIL) {
                continue;
            }

            List<String> normalizedSentences = new ArrayList<>();
            for (ParagraphSentence sentence : paragraph.getSentences()) {
                String content = sentence.getContent() == null
                        ? ""
                        : sentence.getContent().trim();
                if (content.isEmpty()) {
                    continue;
                }

                normalizedSentences.addAll(Arrays.stream(content.split("\\\\n|\\R"))
                        .map(String::trim)
                        .filter(line -> !line.isEmpty())
                        .flatMap(line -> Arrays.stream(line.split("(?<=[.!?])\\s+")))
                        .map(String::trim)
                        .filter(line -> !line.isEmpty())
                        .toList());
            }

            List<ParagraphSentence> rebuiltSentences = new ArrayList<>();
            for (int i = 0; i < normalizedSentences.size(); i++) {
                ParagraphSentence newSentence = ParagraphSentence.builder()
                        .paragraph(paragraph)
                        .orderIndex(i)
                        .content(normalizedSentences.get(i))
                        .build();
                rebuiltSentences.add(newSentence);
            }
            log.info(
                    "Paragraph sentence fixer for paragraphId={}: before={} after={}",
                    paragraph.getId(),
                    paragraph.getSentences().size(),
                    normalizedSentences.size());
            paragraph.setSentences(rebuiltSentences);
            paragraphRepository.save(paragraph);
        }
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

        @Bean
        @ConditionalOnProperty(name = "app.data-init.sentences.enabled", havingValue = "true")
        ApplicationRunner initSentenceHintsFromAi(
                com.nta.domain.paragraphSentence.Repository paragraphSentenceRepository,
                com.nta.domain.paragraphSentenceHint.Repository paragraphSentenceHintRepository,
                com.nta.domain.paragraphSentence.Service paragraphSentenceService,
                @Value("${app.data-init.sentences.max-retries-per-item:5}") int maxRetriesPerItem,
                @Value("${app.data-init.sentences.parallelism:4}") int parallelism) {
            return args -> runSentenceAiSeed(
                    paragraphSentenceRepository,
                    paragraphSentenceHintRepository,
                    paragraphSentenceService,
                    maxRetriesPerItem,
                    parallelism);
        }

        private void runParagraphAiSeed(
                com.nta.domain.paragraph.Service paragraphService, int maxRetriesPerItem, int parallelism) {
            int poolSize = Math.max(1, parallelism);
            AtomicInteger done = new AtomicInteger();
            AtomicInteger failed = new AtomicInteger();

            List<Callable<Void>> tasks = new ArrayList<>();
            for (Type type : Type.values()) {
                if (type == Type.SINGLE_SENTENCE
                        || type == Type.EMAIL
                        || type == Type.IELTS_TASK1
                        || type == Type.IELTS_TASK2
                        || type == Type.DIARIES) {
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

        private void runSentenceAiSeed(
                com.nta.domain.paragraphSentence.Repository paragraphSentenceRepository,
                com.nta.domain.paragraphSentenceHint.Repository paragraphSentenceHintRepository,
                com.nta.domain.paragraphSentence.Service paragraphSentenceService,
                int maxRetriesPerItem,
                int parallelism) {
            List<ParagraphSentence> targets = paragraphSentenceRepository.findAll().stream()
                    .filter(sentence -> !paragraphSentenceHintRepository.existsByParagraphSentenceIdAndTargetLanguage(
                            sentence.getId(), TargetLanguage.EN))
                    .toList();
            if (targets.isEmpty()) {
                log.info("Sentence AI init: no sentence without vocabulary hints");
                return;
            }

            int poolSize = Math.max(1, parallelism);
            AtomicInteger done = new AtomicInteger();
            AtomicInteger failed = new AtomicInteger();

            List<Callable<Void>> tasks = new ArrayList<>();
            for (ParagraphSentence sentence : targets) {
                Long sentenceId = sentence.getId();
                tasks.add(() -> {
                    ParagraphSentenceHint saved =
                            generateSentenceHintsWithRetries(paragraphSentenceService, sentenceId, maxRetriesPerItem);
                    if (saved != null) {
                        done.incrementAndGet();
                        log.info(
                                "Sentence AI init: sentenceId={} orderIndex={}",
                                saved.getParagraphSentence().getId(),
                                saved.getParagraphSentence().getOrderIndex());
                    } else {
                        failed.incrementAndGet();
                    }
                    return null;
                });
            }

            ExecutorService executor = Executors.newFixedThreadPool(poolSize);
            try {
                List<Future<Void>> futures = executor.invokeAll(tasks);
                for (Future<Void> future : futures) {
                    try {
                        future.get();
                    } catch (ExecutionException e) {
                        failed.incrementAndGet();
                        log.error("Sentence AI init task failed", e.getCause());
                    }
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Sentence AI init interrupted", e);
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
            log.info(
                    "Sentence AI init finished: total={}, created={}, failed={}",
                    targets.size(),
                    done.get(),
                    failed.get());
        }

        private ParagraphSentenceHint generateSentenceHintsWithRetries(
                com.nta.domain.paragraphSentence.Service paragraphSentenceService,
                Long sentenceId,
                int maxRetriesPerItem) {
            Exception last = null;
            for (int attempt = 1; attempt <= maxRetriesPerItem; attempt++) {
                try {
                    return paragraphSentenceService.getOrCreateVocabularyHints(sentenceId);
                } catch (Exception e) {
                    last = e;
                    log.warn(
                            "Sentence AI init attempt {}/{} sentenceId={}: {}",
                            attempt,
                            maxRetriesPerItem,
                            sentenceId,
                            e.getMessage());
                }
            }

            log.error("Sentence AI init gave up after {} attempts sentenceId={}", maxRetriesPerItem, sentenceId, last);
            return null;
        }
    }
}
