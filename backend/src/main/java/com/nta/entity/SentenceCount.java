package com.nta.entity;

import java.util.Set;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sentence_count")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SentenceCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private int size;

    @OneToMany(mappedBy = "sentenceCount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Writing> writings;
}
