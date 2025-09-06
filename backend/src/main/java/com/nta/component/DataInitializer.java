package com.nta.component;

import java.util.List;
import java.util.Set;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.nta.constant.PredefinedRole;
import com.nta.entity.Tone;
import com.nta.entity.Topic;
import com.nta.entity.TopicGroup;
import com.nta.repository.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

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
            TopicRepository topicRepository,
            LevelRepository levelRepository,
            SentenceCountRepository sentenceCountRepository,
            TopicGroupRepository topicGroupRepository,
            RoleRepository repository,
            RoleRepository roleRepository,
            ToneRepository toneRepository) {
        return args -> {
            // Initialization logic here
            System.out.println("DataInitializer: Application started, performing initialization...");

            if (topicRepository.count() == 0 && topicGroupRepository.count() == 0) {
                final TopicGroup topicGroup1 = TopicGroup.builder()
                        .name("Giao tiếp hàng ngày")
                        .topics(Set.of(
                                Topic.builder()
                                        .name("life")
                                        .description("Cuộc sống")
                                        .build(),
                                Topic.builder()
                                        .name("health")
                                        .description("Sức khỏe")
                                        .build(),
                                Topic.builder()
                                        .name("education")
                                        .description("Giáo dục")
                                        .build(),
                                Topic.builder()
                                        .name("environment")
                                        .description("Môi trường")
                                        .build(),
                                Topic.builder()
                                        .name("culture")
                                        .description("Văn hóa")
                                        .build(),
                                Topic.builder()
                                        .name("technology")
                                        .description("Công nghệ")
                                        .build(),
                                Topic.builder()
                                        .name("travel")
                                        .description("Du lịch")
                                        .build(),
                                Topic.builder()
                                        .name("food")
                                        .description("Ẩm thực")
                                        .build()))
                        .build();

                topicGroup1.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup1));

                final TopicGroup topicGroup2 = TopicGroup.builder()
                        .name("Chủ đề học thuật")
                        .topics(Set.of(
                                Topic.builder()
                                        .name("science")
                                        .description("Khoa học")
                                        .build(),
                                Topic.builder()
                                        .name("history")
                                        .description("Lịch sử")
                                        .build(),
                                Topic.builder()
                                        .name("politics")
                                        .description("Chính trị")
                                        .build(),
                                Topic.builder()
                                        .name("economics")
                                        .description("Kinh tế")
                                        .build(),
                                Topic.builder()
                                        .name("art")
                                        .description("Nghệ thuật")
                                        .build(),
                                Topic.builder()
                                        .name("literature")
                                        .description("Văn học")
                                        .build(),
                                Topic.builder()
                                        .name("philosophy")
                                        .description("Triết học")
                                        .build(),
                                Topic.builder()
                                        .name("psychology")
                                        .description("Tâm lý học")
                                        .build()))
                        .build();

                topicGroup2.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup2));

                topicGroupRepository.saveAll(List.of(topicGroup1, topicGroup2));
                System.out.println("DataInitializer: Seeded topics.");
            }

            if (levelRepository.count() == 0) {
                levelRepository.saveAll(List.of(
                        com.nta.entity.Level.builder()
                                .name("A2")
                                .description("Dễ")
                                .build(),
                        com.nta.entity.Level.builder()
                                .name("B1")
                                .description("Trung bình")
                                .build(),
                        com.nta.entity.Level.builder()
                                .name("B2")
                                .description("Khó")
                                .build(),
                        com.nta.entity.Level.builder()
                                .name("C1")
                                .description("Rất khó")
                                .build(),
                        com.nta.entity.Level.builder()
                                .name("C2")
                                .description("Siêu khó")
                                .build()));
                System.out.println("DataInitializer: Seeded levels.");
            }

            if (sentenceCountRepository.count() == 0) {
                sentenceCountRepository.saveAll(List.of(
                        com.nta.entity.SentenceCount.builder().size(10).build(),
                        com.nta.entity.SentenceCount.builder().size(15).build(),
                        com.nta.entity.SentenceCount.builder().size(20).build()));
            }

            if (roleRepository.findByName(PredefinedRole.USER_ROLE) == null) {
                repository.save(com.nta.entity.Role.builder()
                        .name(PredefinedRole.USER_ROLE)
                        .build());
            }

            if (toneRepository.count() == 0) {
                toneRepository.saveAll(List.of(
                        Tone.builder()
                                .name("Formal")
                                .description("Trang trọng, lịch sự")
                                .build(),
                        Tone.builder()
                                .name("Informal")
                                .description("Thân mật, đời thường")
                                .build(),
                        Tone.builder()
                                .name("Friendly")
                                .description("Thân thiện, ấm áp")
                                .build(),
                        Tone.builder()
                                .name("Professional")
                                .description("Chuyên nghiệp, chuẩn mực")
                                .build()));
            }
        };
    }
}
