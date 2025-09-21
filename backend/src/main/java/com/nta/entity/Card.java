package com.nta.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cards")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "note_id", nullable = false)
    private Long noteId;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType = CardType.BASIC;

    @Column(name = "front_template", columnDefinition = "TEXT", nullable = false)
    private String frontTemplate;

    @Column(name = "back_template", columnDefinition = "TEXT", nullable = false)
    private String backTemplate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", insertable = false, updatable = false)
    private Note note;

    @OneToMany(mappedBy = "cardId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;

    @OneToMany(mappedBy = "cardId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CardStats> cardStats;

    public enum CardType {
        BASIC, // Front/Back card
        CLOZE, // Cloze deletion card
        REVERSE // Reverse card
    }
}
