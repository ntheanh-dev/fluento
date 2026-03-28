package com.nta.common.component;

import java.util.HashSet;

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
                @Value("${app.data-init.paragraphs.max-combinations:0}") int maxCombinations,
                @Value("${app.data-init.paragraphs.max-retries-per-item:20}") int maxRetriesPerItem) {
            return args -> runParagraphAiSeed(paragraphService, maxCombinations, maxRetriesPerItem);
        }

        private void runParagraphAiSeed(
                com.nta.domain.paragraph.Service paragraphService, int maxCombinations, int maxRetriesPerItem) {
            int done = 0;
            int failed = 0;
            boolean stop = false;
            for (Type type : Type.values()) {
                if (stop) {
                    break;
                }
                for (Level level : Level.values()) {
                    if (stop) {
                        break;
                    }
                    for (Topic topic : Topic.values()) {
                        if (maxCombinations > 0 && done >= maxCombinations) {
                            stop = true;
                            break;
                        }
                        CreateParagraphRequest request = CreateParagraphRequest.builder()
                                .type(type)
                                .level(level)
                                .topic(topic)
                                .tone(Tone.FORMAL)
                                .sentenceCount(defaultSentenceCount(type))
                                .build();
                        Paragraph saved = findOrcreateWithRetries(
                                paragraphService, request, type, level, topic, maxRetriesPerItem);
                        if (saved != null) {
                            done++;
                            log.info(
                                    "Paragraph AI init: saved id={} type={} level={} topic={}",
                                    saved.getId(),
                                    type,
                                    level,
                                    topic);
                        } else {
                            failed++;
                        }
                    }
                }
            }
            log.info("Paragraph AI init finished: created={}, failed={}", done, failed);
        }

        private Paragraph findOrcreateWithRetries(
                com.nta.domain.paragraph.Service paragraphService,
                CreateParagraphRequest request,
                Type type,
                Level level,
                Topic topic,
                int maxRetriesPerItem) {
            Exception last = null;
            for (int attempt = 1; attempt <= maxRetriesPerItem; attempt++) {
                try {
                    return paragraphService.findOrcreate(request);
                } catch (Exception e) {
                    last = e;
                    log.warn(
                            "Paragraph AI init attempt {}/{} type={} level={} topic={}: {}",
                            attempt,
                            maxRetriesPerItem,
                            type,
                            level,
                            topic,
                            e.getMessage());
                }
            }
            log.error(
                    "Paragraph AI init gave up after {} attempts type={} level={} topic={}",
                    maxRetriesPerItem,
                    type,
                    level,
                    topic,
                    last);
            return null;
        }

        private static SentenceCount defaultSentenceCount(Type type) {
            return type == Type.SINGLE_SENTENCE ? SentenceCount.TEN : null;
        }
    }
}
