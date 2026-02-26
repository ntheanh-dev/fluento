package com.nta.domain.hint;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.nta.domain.hint.dto.response.HintTranslationResponse;
import com.nta.domain.paragraph.Paragraph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paragraph_id")
    private Paragraph paragraph;

    @Column(nullable = false)
    private Integer orderIndex;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private HintTranslationResponse hints;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
