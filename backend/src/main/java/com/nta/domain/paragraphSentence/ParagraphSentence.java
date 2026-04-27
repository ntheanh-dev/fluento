package com.nta.domain.paragraphSentence;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.paragraph.Paragraph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paragraph_sentences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParagraphSentence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "paragraph_id", nullable = false)
    private Paragraph paragraph;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;
}
