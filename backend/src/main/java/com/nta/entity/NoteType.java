package com.nta.entity;

import java.util.List;

import jakarta.persistence.*;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "note_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoteType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    // Relationships
    @OneToMany(mappedBy = "noteTypeId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Field> fields;

    @OneToMany(mappedBy = "noteTypeId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Note> notes;
}
