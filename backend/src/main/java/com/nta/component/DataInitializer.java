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

import java.util.List;

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
            RoleRepository repository,
            RoleRepository roleRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println(
                    "DataInitializer: Application started, performing initialization...");

            if(userRepository.findByUsername("a@a.com").isEmpty()) {
                userRepository.save(User.builder()
                        .username("a@a.com")
                        .password(passwordEncoder.encode("admin123"))
                        .build());
            }

            if (roleRepository.findByName(PredefinedRole.USER_ROLE) == null) {
                repository.save(
                        com.nta.entity.Role.builder().name(PredefinedRole.USER_ROLE).build());
            }

        };
    }
}
