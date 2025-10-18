package com.nta.component;

import com.nta.constant.PredefinedRole;
import com.nta.entity.*;
import com.nta.repository.*;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

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
            ToneRepository toneRepository,
            UserRepository userRepository,
            NoteTypeRepository noteTypeRepository,
            FieldRepository fieldRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            // Initialization logic here
            System.out.println(
                    "DataInitializer: Application started, performing initialization...");

            if(userRepository.findByUsername("admin").isEmpty()) {
                userRepository.save(User.builder()
                        .username("a@a.com")
                        .password(passwordEncoder.encode("admin123"))
                        .build());
            }

            if (topicRepository.count() == 0 && topicGroupRepository.count() == 0) {
                final TopicGroup topicGroup1 =
                        TopicGroup.builder()
                                .name("Giao tiếp hàng ngày")
                                .topics(
                                        Set.of(
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

                final TopicGroup topicGroup2 =
                        TopicGroup.builder()
                                .name("Chủ đề học thuật")
                                .topics(
                                        Set.of(
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

                // Group 3: Kinh doanh & Công nghệ
                final TopicGroup topicGroup3 =
                        TopicGroup.builder()
                                .name("Kinh doanh & Công nghệ")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("business")
                                                                .description("Kinh doanh")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("marketing")
                                                                .description("Tiếp thị")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("finance")
                                                                .description("Tài chính")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("startups")
                                                                .description("Khởi nghiệp")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("ecommerce")
                                                                .description("Thương mại điện tử")
                                                                .build())))
                                .build();
                topicGroup3.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup3));

                // Group 4: Nghệ thuật & Giải trí
                final TopicGroup topicGroup4 =
                        TopicGroup.builder()
                                .name("Nghệ thuật & Giải trí")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("music")
                                                                .description("Âm nhạc")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("movies")
                                                                .description("Phim ảnh")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("theatre")
                                                                .description("Kịch nghệ")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("fashion")
                                                                .description("Thời trang")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("games")
                                                                .description("Trò chơi")
                                                                .build())))
                                .build();
                topicGroup4.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup4));

                // Group 5: Cuộc sống hàng ngày
                final TopicGroup topicGroup5 =
                        TopicGroup.builder()
                                .name("Cuộc sống hàng ngày")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("shopping")
                                                                .description("Mua sắm")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("housework")
                                                                .description("Việc nhà")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("relationships")
                                                                .description("Các mối quan hệ")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("pets")
                                                                .description("Thú cưng")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("holidays")
                                                                .description("Ngày lễ")
                                                                .build())))
                                .build();
                topicGroup5.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup5));

                // Group 6: Môi trường & Xã hội
                final TopicGroup topicGroup6 =
                        TopicGroup.builder()
                                .name("Môi trường & Xã hội")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("climate-change")
                                                                .description("Biến đổi khí hậu")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("sustainability")
                                                                .description("Phát triển bền vững")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("globalization")
                                                                .description("Toàn cầu hóa")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("poverty")
                                                                .description("Nghèo đói")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("human-rights")
                                                                .description("Nhân quyền")
                                                                .build())))
                                .build();
                topicGroup6.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup6));

                // Group 7: Du lịch & Địa lý
                final TopicGroup topicGroup7 =
                        TopicGroup.builder()
                                .name("Du lịch & Địa lý")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("countries")
                                                                .description("Các quốc gia")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("landmarks")
                                                                .description("Danh lam thắng cảnh")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("transportation")
                                                                .description("Giao thông")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("weather")
                                                                .description("Thời tiết")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("tourism")
                                                                .description("Du lịch")
                                                                .build())))
                                .build();
                topicGroup7.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup7));

                // Group 8: Thể thao & Sức khỏe
                final TopicGroup topicGroup8 =
                        TopicGroup.builder()
                                .name("Thể thao & Sức khỏe")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("fitness")
                                                                .description("Thể hình")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("yoga")
                                                                .description("Yoga")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("nutrition")
                                                                .description("Dinh dưỡng")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("mental-health")
                                                                .description("Sức khỏe tinh thần")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("medicine")
                                                                .description("Y học")
                                                                .build())))
                                .build();
                topicGroup8.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup8));

                // Group 9: Gia đình & Xã hội
                final TopicGroup topicGroup9 =
                        TopicGroup.builder()
                                .name("Gia đình & Xã hội")
                                .topics(
                                        new LinkedHashSet<>(
                                                List.of(
                                                        Topic.builder()
                                                                .name("parenting")
                                                                .description("Nuôi dạy con cái")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("marriage")
                                                                .description("Hôn nhân")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("community")
                                                                .description("Cộng đồng")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("volunteering")
                                                                .description("Tình nguyện")
                                                                .build(),
                                                        Topic.builder()
                                                                .name("traditions")
                                                                .description("Truyền thống")
                                                                .build())))
                                .build();
                topicGroup9.getTopics().forEach(topic -> topic.setTopicGroup(topicGroup9));

                // lưu tất cả
                topicGroupRepository.saveAll(
                        List.of(
                                topicGroup1,
                                topicGroup2,
                                topicGroup3,
                                topicGroup4,
                                topicGroup5,
                                topicGroup6,
                                topicGroup7,
                                topicGroup8,
                                topicGroup9));
                System.out.println("DataInitializer: Seeded topics.");
            }

            if (levelRepository.count() == 0) {
                levelRepository.saveAll(
                        List.of(
                                com.nta.entity.Level.builder().name("A2").description("Dễ").build(),
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
                sentenceCountRepository.saveAll(
                        List.of(
                                com.nta.entity.SentenceCount.builder().size(5).build(),
                                com.nta.entity.SentenceCount.builder().size(10).build(),
                                com.nta.entity.SentenceCount.builder().size(15).build(),
                                com.nta.entity.SentenceCount.builder().size(20).build()));
            }

            if (roleRepository.findByName(PredefinedRole.USER_ROLE) == null) {
                repository.save(
                        com.nta.entity.Role.builder().name(PredefinedRole.USER_ROLE).build());
            }

            if (toneRepository.count() == 0) {
                toneRepository.saveAll(
                        List.of(
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

            if (noteTypeRepository.count() == 0) {

                final NoteType nt =
                        noteTypeRepository.save(NoteType.builder().name("Default").build());

                fieldRepository.saveAll(
                        List.of(
                                Field.builder()
                                        .name("word")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(1)
                                        .isRequired(true)
                                        .build(),
                                Field.builder()
                                        .name("audio")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(2)
                                        .isRequired(false)
                                        .build(),
                                Field.builder()
                                        .name("phonetic")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(3)
                                        .isRequired(true)
                                        .build(),
                                Field.builder()
                                        .name("meaning")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(4)
                                        .isRequired(true)
                                        .build(),
                                Field.builder()
                                        .name("pos")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(5)
                                        .isRequired(true)
                                        .build(),
                                Field.builder()
                                        .name("example1")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(6)
                                        .isRequired(true)
                                        .build(),
                                Field.builder()
                                        .name("audioExample1")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(7)
                                        .isRequired(false)
                                        .build(),
                                Field.builder()
                                        .name("example2")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(8)
                                        .isRequired(true)
                                        .build(),
                                Field.builder()
                                        .name("audioExample2")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(9)
                                        .isRequired(false)
                                        .build(),
                                Field.builder()
                                        .name("image")
                                        .noteTypeId(nt.getId())
                                        .fieldOrder(10)
                                        .isRequired(false)
                                        .build()));
            }
        };
    }
}
