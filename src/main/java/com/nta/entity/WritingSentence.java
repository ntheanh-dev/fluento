package com.nta.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "writing_sentences")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WritingSentence {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "writing_id", nullable = false)
    private Writing writing;

    @Column(name = "sentence_index")
    private Integer sentenceIndex;

    @Column(name = "vietnamese_sentence", columnDefinition = "TEXT")
    private String vietnamese;

    @Column(name = "user_english", columnDefinition = "TEXT")
    private String userEnglish;

    @Column(name = "ai_correction", columnDefinition = "TEXT")
    private String aiCorrection;

    @Column(name = "ai_suggestion", columnDefinition = "TEXT")
    private String aiSuggestion;

    @ManyToOne
    @JoinColumn(name = "ai_level_id")
    private Level aiLevel; // optional

    @OneToMany(mappedBy = "sentence", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SentenceHighlight> highlights;
}
