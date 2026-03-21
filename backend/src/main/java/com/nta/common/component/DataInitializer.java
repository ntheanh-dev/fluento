package com.nta.common.component;

import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.nta.common.constant.PredefinedRole;
import com.nta.domain.role.Role;
import com.nta.domain.user.User;

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
            com.nta.domain.role.Repository roleRepository,
            com.nta.domain.user.Repository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("DataInitializer: Application started, performing initialization...");

            if (userRepository.findByUsername("a@a.com").isEmpty()) {
                userRepository.save(User.builder()
                        .username("a@a.com")
                        .password(passwordEncoder.encode("admin123"))
                        .credits(100)
                        .build());
            }

            if (roleRepository.findByName(PredefinedRole.USER_ROLE) == null) {
                roleRepository.save(
                        Role.builder().name(PredefinedRole.USER_ROLE).build());
            }
        };
    }
}
