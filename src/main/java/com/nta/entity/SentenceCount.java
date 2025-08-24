package com.nta.entity;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

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

    private int size;

    @OneToMany(mappedBy = "sentenceCount", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Writing> writings;
}
