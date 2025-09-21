package com.nta.entity;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "notes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Note {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "note_type_id", nullable = false)
    private Long noteTypeId;

    @Column(name = "deck_id", nullable = false)
    private Long deckId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_type_id", insertable = false, updatable = false)
    private NoteType noteType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", insertable = false, updatable = false)
    private Deck deck;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    @OneToMany(mappedBy = "noteId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<NoteField> noteFields;

    @OneToMany(mappedBy = "noteId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Card> cards;
}
