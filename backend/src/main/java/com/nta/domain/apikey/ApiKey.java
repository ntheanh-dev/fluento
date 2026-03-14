package com.nta.domain.apikey;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.nta.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Một row = một cặp (api key + model). User thêm 1 key → tạo 3 row (ứng với 3 AiModelName).
 */
@Entity
@Table(name = "api_keys", uniqueConstraints = @UniqueConstraint(columnNames = {"api_key", "model"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApiKey {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    @Column(name = "api_key", nullable = false, length = 512)
    private String apiKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "model", nullable = false, length = 50)
    private AiModelName model;

    @Column(name = "credit", nullable = false)
    @Builder.Default
    private Integer credit = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
