package com.nta.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sentence_highlights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentenceHighlight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sentence_id", nullable = false)
    private WritingSentence sentence;

    @Column(name = "highlight_text", length = 255)
    private String text;

    private String color = "yellow";
}
