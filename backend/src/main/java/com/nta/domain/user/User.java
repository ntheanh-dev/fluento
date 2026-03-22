package com.nta.domain.user;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @ManyToMany
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_name"))
    Set<com.nta.domain.role.Role> roles;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "full_name", length = 255)
    private String fullName;

    @Column(name = "password")
    private String password;

    @Column(name = "url_avatar", columnDefinition = "TEXT")
    private String urlAvatar;
    /** ID của row api_keys đang được chọn (một row = một key + một model). */
    @Column(name = "active_api_key_id")
    private Long activeApiKeyId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Column(name = "longest_streak")
    private Integer longestStreak = 0;

    @Column(name = "last_submission_date")
    private LocalDate lastSubmissionDate;

    /** Thời điểm đăng nhập thành công gần nhất (password hoặc OAuth). */
    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(nullable = false)
    private Integer credits = 0;
}
