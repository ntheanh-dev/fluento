package com.nta.domain.sentence;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.nta.domain.writing.Writing;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    @JsonBackReference
    private Writing writing;

    @Column(nullable = false)
    private Integer orderIndex;

    @Column(nullable = false)
    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
