package com.nta.domain.paragraphSentenceHint;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.paragraphSentence.ParagraphSentence;
import com.nta.domain.paragraphSentence.VocabularyHint;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "paragraph_sentence_hints",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_paragraph_sentence_hints_sentence_language",
                    columnNames = {"paragraph_sentence_id", "target_language"})
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParagraphSentenceHint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "paragraph_sentence_id", nullable = false)
    private ParagraphSentence paragraphSentence;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_language", nullable = false, length = 5)
    private TargetLanguage targetLanguage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "hints_json", columnDefinition = "json", nullable = false)
    private List<VocabularyHint> hintsJson;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
