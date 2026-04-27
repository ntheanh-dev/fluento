package com.nta.domain.vocabulary;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.deck.Deck;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;
import com.nta.domain.user.User;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(
        name = "vocabularies",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_vocabularies_user_language_text",
                    columnNames = {"user_id", "target_language", "text"})
        })
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "decks"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vocabulary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_language", nullable = false, length = 5)
    private TargetLanguage targetLanguage;

    @Column(nullable = false, length = 255)
    private String text;

    @Column(name = "part_of_speech", length = 100)
    private String partOfSpeech;

    @Column(columnDefinition = "TEXT")
    private String meaning;

    @Column(length = 255)
    private String pronunciation;

    @Column(name = "example_sentence", columnDefinition = "TEXT")
    private String exampleSentence;

    @ManyToMany(mappedBy = "vocabularies", fetch = FetchType.LAZY)
    @JsonIgnore
    private Set<Deck> decks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
