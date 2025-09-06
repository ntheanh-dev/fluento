package com.nta.entity;

import java.util.Set;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tones")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String name; // e.g., Formal, Informal, Friendly, Professional

    private String description;

    @OneToMany(mappedBy = "tone", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Writing> writings;
}
