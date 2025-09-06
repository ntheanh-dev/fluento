package com.nta.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "writings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Writing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false, unique = true)
    private String conversationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "tone_id")
    private Tone tone;

    @ManyToOne
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @ManyToOne
    @JoinColumn(name = "level_id")
    private Level level;

    @ManyToOne
    @JoinColumn(name = "sentence_count_id")
    private SentenceCount sentenceCount;

    @Column(name = "vietnamese_paragraph", columnDefinition = "TEXT")
    private String vietnameseParagraph;

    @Column(name = "translated_paragraph", columnDefinition = "TEXT")
    private String translatedParagraph;

    @OneToMany(mappedBy = "writing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Column(name = "english_sentences", columnDefinition = "TEXT")
    @JsonManagedReference
    private List<Sentence> englishSentences = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
