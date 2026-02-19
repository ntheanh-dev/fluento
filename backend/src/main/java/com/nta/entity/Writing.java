package com.nta.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.nta.enums.Level;
import com.nta.enums.SentenceCount;
import com.nta.enums.Tone;
import com.nta.enums.Topic;
import com.nta.enums.WritingType;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private WritingType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "tone")
    private Tone tone;

    @Enumerated(EnumType.STRING)
    @Column(name = "topic")
    private Topic topic;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private Level level;

    @Enumerated(EnumType.STRING)
    @Column(name = "sentence_count")
    private SentenceCount sentenceCount;

    @Column(name = "vietnamese_paragraph", columnDefinition = "TEXT")
    private String vietnameseParagraph;

    @Column(name = "custom_text", columnDefinition = "TEXT")
    private String customText;

    @OneToMany(mappedBy = "writing", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Column(name = "english_sentences", columnDefinition = "TEXT")
    @JsonManagedReference
    private List<Sentence> englishSentences = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
}
