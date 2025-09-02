package com.nta.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "sentences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sentence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String vietnamese;

    @Column(nullable = false)
    private String englishTranslation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "writing_id", nullable = false)
    private Writing writing;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private Integer score;

    private String feedback;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
