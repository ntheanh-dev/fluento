package com.nta.domain.hint;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.paragraph.Paragraph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "hints",
        uniqueConstraints = {@UniqueConstraint(columnNames = {"paragraph_id", "order_index"})})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hint {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "paragraph_id")
    private Paragraph paragraph;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "json")
    private HintContent hints;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
