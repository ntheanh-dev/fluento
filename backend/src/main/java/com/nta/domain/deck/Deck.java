package com.nta.domain.deck;

import java.time.LocalDateTime;
import java.util.Set;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nta.domain.paragraphSentenceHint.enums.TargetLanguage;
import com.nta.domain.user.User;
import com.nta.domain.vocabulary.Vocabulary;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(
        name = "decks",
        uniqueConstraints = {
            @UniqueConstraint(
                    name = "uk_decks_user_language_name",
                    columnNames = {"user_id", "target_language", "name"})
        })
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"user", "vocabularies"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Deck {
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

    @Column(nullable = false, length = 150)
    private String name;

    @Column(name = "icon", nullable = false, length = 64)
    private String icon;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "deck_vocabularies",
            joinColumns = @JoinColumn(name = "deck_id"),
            inverseJoinColumns = @JoinColumn(name = "vocabulary_id"))
    private Set<Vocabulary> vocabularies;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
